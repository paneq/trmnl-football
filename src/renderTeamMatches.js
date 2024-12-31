export async function renderTeamMatches(teamId, env) {
    const response = await fetch(`http://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&limit=5`, {
        headers: {
            'X-Auth-Token': env.FOOTBALL_DATA_API_KEY
        }
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json()
    console.log(data);

    const matchItems = data.matches.map(match => `
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
        `).join('\n')

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
    return html;
}
