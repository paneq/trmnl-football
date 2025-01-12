import {Hono, HonoRequest} from 'hono'
import {logger} from 'hono/logger'
import compare from 'secure-compare'
import {handleNewOAuth} from './handleNewOAuth'
import {handleSettings} from './handleSettings'
import {handleSettingsUpdate} from './handleSettingsUpdate'
import {fetchAndRenderTeamMatches, MatchesList} from './renderTeamMatches'
import {TableStandings} from './TableStandings'
import {Column, Columns, Full} from './trml'
import {setEnv} from "./globals";
import {fetchStandings, fetchTeamMatches, StandingsApiResponse} from "./football-data-client";
import {Bindings} from "./bindings";

function bearerToken(req: HonoRequest): string | null {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
        return null
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return null
    }

    return parts[1]
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', async (c, next) => {
    setEnv(c.env)
    await next()
})
app.use('*', logger())

// Main route for displaying matches
app.post('/trmnl/render', async (c) => {
    const env = c.env
    // const teamIds = [86, 81, 66]
    const providedToken = bearerToken(c.req)
    const data = await c.req.parseBody()
    const userUuid = data.user_uuid
    const userData: string | null = await c.env.KV.get(userUuid)
    const parsedData = userData ? JSON.parse(userData) : {}
    const storedToken: string | null = parsedData.accessToken
    const teamId: number | null = parsedData.teamId

    if (!providedToken) {
        console.error('Missing token')
        return c.json({ error: 'Missing token' }, 401)
    }
    if (!storedToken) {
        console.error(`Unknown user UUID: ${userUuid}`)
        return c.json({ error: 'Unknown user' }, 401)
    }
    if (!compare(providedToken, storedToken)) {
        console.error(`Invalid token: ${providedToken}. Expected: ${storedToken}. User UUID: ${userUuid}`)
        return c.json({ error: 'Invalid token' }, 401)
    }
    if (!teamId) {
        console.error(`Missing teamId for user: ${userUuid}`)
        return c.text('Missing teamId. Please press "Configure" in your plugin settings and pick your favorite team', 200)
    }

    try {
        const html = await fetchAndRenderTeamMatches(teamId, c.env)
        const htmlString = await html.toString()
        return c.json({
            markup: htmlString,
            markup_half_horizontal: '',
            markup_half_vertical: '',
            markup_quadrant: ''
        })
    } catch (error) {
        console.error('Error fetching matches:', error)
        return c.text('Error fetching matches', 500)
    }
})

app.get('/trmnl/teams/:teamId', async (c) => {
    const teamId = parseInt(c.req.param('teamId'))
    return c.html(fetchAndRenderTeamMatches(teamId, c.env))
})

app.get('/trmnl/barcelona', async (c) => {
    return c.html(fetchAndRenderTeamMatches(81, c.env))
})

app.get('/trmnl/barcelona/standings', async (c) => {
    const competitionId = 2014 // Primera Division
    const teamId = 81 // Barcelona
    const data = await fetchStandings(competitionId)
    return c.html(<Full><TableStandings variant={'regular'} data={data} teamId={teamId} /></Full>)
})

app.get('/trmnl/barcelona/demo', async (c) => {
    const teamId = 81 // Barcelona
    const matches = await fetchTeamMatches(teamId);
    let standing: null | StandingsApiResponse = null;
    if (matches[0] && matches[0].competition) {
        const competitionId = matches[0].competition.id
        try {
            standing = await fetchStandings(competitionId)
        } catch (error) {
            console.log(`Error fetching standings for competition ${competitionId}`)
            console.log(error)
        }

    }
    const fullScreenHtml = <Full>
        <Columns>
            <Column>
                <MatchesList matches={matches}/>
            </Column>
            <Column>
                <TableStandings variant={'compact'} data={standing} teamId={teamId} />
            </Column>
        </Columns>
    </Full>
    return c.html(fullScreenHtml)
})

// OAuth routes
app.get('/trmnl/oauth/new', async (c) => {
    return handleNewOAuth(c.req, c.env)
})

// Installation webhook
app.post('/trmnl/installed', async (c) => {
    try {
        const bearerAccessToken = c.req.header('Authorization')
        if (!bearerAccessToken) {
            return c.text('Unauthorized', 401)
        }

        const accessToken = bearerAccessToken.replace('Bearer ', '')
        const body = await c.req.json()
        const user = body.user

        // Log installation
        console.log(JSON.stringify({
            type: 'installation',
            user: user,
            timestamp: new Date().toISOString()
        }))

        await c.env.KV.put(
            accessToken,
            JSON.stringify({
                user: user,
            })
        )

        await c.env.KV.put(
            user.uuid,
            JSON.stringify({
                accessToken: accessToken,
                user: user,
            })
        )

        return new Response(null, {
            status: 204,
        })
    } catch (error) {
        console.error('Error handling installation:', error)
        return c.text('Error processing installation', 500)
    }
})

app.get('/trmnl/settings', async (c) => {
    return handleSettings(c);
})

app.post('/trmnl/settings/update', async (c) => {
    return handleSettingsUpdate(c);
})

// Error handling middleware
app.onError((err, c) => {
    console.error(JSON.stringify({
        type: 'error',
        error: err.message,
        path: c.req.path,
        method: c.req.method,
        timestamp: new Date().toISOString()
    }))

    return c.text('Internal Server Error', 500)
})

export default app
