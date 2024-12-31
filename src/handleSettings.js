const TOP_LEAGUES = {
    PL: 2021,  // Premier League
    PD: 2014,  // La Liga
    BL1: 2002, // Bundesliga
    SA: 2019,  // Serie A
    FL1: 2015  // Ligue 1
};

export async function handleSettings(c) {
    const user_uuid = c.req.query('uuid');
    if (!user_uuid) {
        return c.text('UUID is required', 400);
    }

    // Now you can use the uuid to fetch user-specific data
    const userData = await c.env.KV.get(user_uuid);
    if (!userData) {
        return c.text('User not found', 404);
    }

    // Fetch teams from each top league
    const teams = await Promise.all(
        Object.entries(TOP_LEAGUES).map(async ([leagueCode, leagueId]) => {
            try {
                const response = await fetch(
                    `http://api.football-data.org/v4/competitions/${leagueId}/teams`,
                    {
                        headers: {
                            'X-Auth-Token': c.env.FOOTBALL_DATA_API_KEY
                        }
                    }
                );
                const data = await response.json();
                return {
                    leagueName: data.competition.name,
                    teams: data.teams || []
                };
            } catch (error) {
                console.error(`Error fetching teams for league ${leagueCode}:`, error);
                return {
                    leagueName: leagueCode,
                    teams: []
                };
            }
        })
    );

    // Create HTML with team options grouped by league
    const teamOptionsHtml = teams
        .map(league => {
            if (league.teams.length === 0) return '';

            return `
                <optgroup label="${league.leagueName}">
                    ${league.teams
                .map(team => `<option value="${team.id}">${team.name}</option>`)
                .join('\n')}
                </optgroup>
            `;
        })
        .join('\n');

    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <link rel="stylesheet" href="https://usetrmnl.com/css/latest/plugins.css">
            </head>
            <body class="environment trmnl">
                <div class="screen">
                    <div class="view view--full">
                        <div class="layout layout--col">
                            <div class="content">
                                <h3 class="title">Select Your Team</h3>
                                <p class="description">Choose your favorite team to follow their matches</p>
                                
                                <form class="form" action="/trmnl/settings/update" method="POST">
                                    <div class="field">
                                        <label class="label">Team</label>
                                        <select name="teamId" class="input" required>
                                            <option value="">Select a team...</option>
                                            ${teamOptionsHtml}
                                        </select>
                                    </div>
                                    
                                    <div class="field">
                                        <button type="submit" class="button button--primary">Save Team</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <div class="title_bar">
                            <img class="image" src="https://usetrmnl.com/images/plugins/trmnl--settings.svg" />
                            <span class="title">Settings</span>
                            <span class="instance">Football</span>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;

    return c.html(html);
}
