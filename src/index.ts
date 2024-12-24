import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { handleNewOAuth } from './handleNewOAuth'

type Bindings = {
    FOOTBALL_DATA_API_KEY: string
    KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Add logging middleware
app.use('*', logger())

// Main route for displaying matches
app.get('/', async (c) => {
    const env = c.env
    const teamIds = [86, 81, 66]

    try {
        const matches = await Promise.all(
            teamIds.map(teamId =>
                fetch(`http://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&limit=1`, {
                    headers: {
                        'X-Auth-Token': env.FOOTBALL_DATA_API_KEY
                    }
                }).then(res => res.json())
            )
        )

        const matchItems = matches.flatMap(response =>
            response.matches.map(match => `
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="title title--small">${match.homeTeam.name} vs ${match.awayTeam.name}</span>
            <span class="description">${match.competition.name}</span>
            <div class="flex gap--small">
              <span class="label label--small label--underline">${match.score.fullTime.home} - ${match.score.fullTime.away}</span>
              <span class="label label--small label--underline">${new Date(match.utcDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `)
        ).join('\n')

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://usetrmnl.com/css/latest/plugins.css">
          <link rel="stylesheet" href="https://usetrmnl.com/js/latest/plugins.js">
        </head>
        <body class="environment trmnl">
          <div class="screen">
            <div class="view view--full">
              <div class="layout layout--col">
                ${matchItems}
              </div>
              
              <div class="title_bar">
                <img class="image" src="https://usetrmnl.com/images/plugins/trmnl--render.svg" />
                <span class="title">Football</span>
                <span class="instance">for Robert</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

        return c.html(html)
    } catch (error) {
        console.error('Error fetching matches:', error)
        return c.text('Error fetching matches', 500)
    }
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
            user: user.email,
            timestamp: new Date().toISOString()
        }))

        await c.env.KV.put(
            accessToken,
            JSON.stringify({
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
