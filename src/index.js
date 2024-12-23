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

async function handleNewOAuth(request, env) {
    const TRMNL_CLIENT_ID = env.TRMNL_CLIENT_ID;
    const TRMNL_CLIENT_SECRET = env.TRMNL_CLIENT_SECRET;

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const installationCallbackUrl = url.searchParams.get('installation_callback_url');

    if (!code) {
        console.log(searchParams);
        return new Response('Missing code parameter', {
            status: 400,
            headers: {
                'content-type': 'text/plain;charset=UTF-8',
            },
        });
    }

    const body = {
        code: code,
        client_id: TRMNL_CLIENT_ID,
        client_secret: TRMNL_CLIENT_SECRET,
        grant_type: 'authorization_code'
    };

    const response = await fetch("https://usetrmnl.com/oauth/token", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        return new Response('Failed to fetch access token', {
            status: response.status,
            headers: {
                'content-type': 'text/plain;charset=UTF-8',
            },
        });
    }

    const data = await response.json();
    const accessToken = data.access_token;
    console.log("Stored access token", accessToken);

    await env.KV.put(
        accessToken.toString(),
        JSON.stringify({
            user: null,
        })
    );
    return Response.redirect(installationCallbackUrl, 302);
}
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if (url.pathname === '/trmnl/oauth/new') {
            return handleNewOAuth(request, env);
        }
        return handleRequest(request, env);
    },
};
