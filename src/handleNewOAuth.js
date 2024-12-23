export async function handleNewOAuth(request, env) {
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
