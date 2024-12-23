import {handleNewOAuth} from "./handleNewOAuth";

async function handleRequest(request, env) {
    const teamIds = [86, 81, 66];

    const matches = await Promise.all(
        teamIds.map(teamId =>
            fetch(`http://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&limit=1`, {
                headers: {
                    'X-Auth-Token': env.FOOTBALL_DATA_API_KEY
                }
            }).then(res => res.json())
        )
    );

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
    ).join('\n');

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
  `;

    return new Response(html, {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
        },
    });
}

// After the user has successfully finished installing the plugin,
// TRMNL sends a success notification to installation_success_webhook_url
// endpoint. Data is sent in JSON format with the following
//
// HTTP Headers:
//
// { 'Authorization': 'Bearer <access_token>', 'Content-Type': 'application/json'
//
// Body:
//
// {
//    "user": {
//      "name": "Test User"
//      "email: "user@trmnl.com"
//      "uuid": "674c9d99-cea1-4e52-9025-9efbe0e30901"
//    }
// }
async function handleInstalledHook(request, env) {
    const bearerAccessToken = request.headers.get('Authorization');
    const accessToken = bearerAccessToken.replace('Bearer ', '');
    const user = await request.json().user;

    await env.KV.put(
        accessToken,
        JSON.stringify({
            user: user,
        })
    );

    return new Response(null, {
        status: 204,
    });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if (url.pathname === '/trmnl/oauth/new') {
            return handleNewOAuth(request, env);
        }
        if (url.pathname === '/trmnl/installed') {
            return handleInstalledHook(request, env);
        }
        return handleRequest(request, env);
    },
};
