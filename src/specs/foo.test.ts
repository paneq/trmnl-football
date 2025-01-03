import {
    env,
    fetchMock,
    SELF
} from "cloudflare:test";
import { describe, it, expect, beforeAll, afterEach } from "vitest";

describe("Happy path", () => {
    // Setup fetch mocking
    beforeAll(() => {
        fetchMock.activate();
        fetchMock.disableNetConnect();
    });

    // Clear all mocks after each test
    afterEach(() => {
        // TODO: FIXME: This is not working
        // fetchMock.resetHandlers();
    });

    it("oauth & installation & settings", async () => {
        // Mock the OAuth token endpoint
        fetchMock
            .get("https://usetrmnl.com")
            .intercept({
                path: "/oauth/token",
                method: "POST",
            })
            .reply(200, {
                access_token: "test-access-token",
                token_type: "Bearer"
            })

        const response = await SELF.fetch(
            "http://example.com/trmnl/oauth/new?code=test-code&installation_callback_url=https://callback.example.com",
            {redirect: 'manual'}
        );

        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe("https://callback.example.com/");

        const storedData = await env.KV.get("test-access-token");
        expect(JSON.parse(storedData)).toEqual({ user: null });

        const installationResponse = await SELF.fetch(
            "http://example.com/trmnl/installed",
            {
                redirect: 'manual',
                headers: {
                    'Authorization': 'Bearer test-access-token',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    user: {
                        name: "Test User",
                        email: "user@trmnl.com",
                        tz: "Eastern Time (US & Canada)",
                        uuid: "674c9d99-cea1-4e52-9025-9efbe0e30901",
                    }
                })
            }
        );
        expect(installationResponse.status).toBe(204);
        // Check that the user was stored in KV
        const user = await env.KV.get("674c9d99-cea1-4e52-9025-9efbe0e30901");
        expect(JSON.parse(user)).toEqual({
            accessToken: 'test-access-token',
            user: {
                name: "Test User",
                email: "user@trmnl.com",
                tz: "Eastern Time (US & Canada)",
                uuid: "674c9d99-cea1-4e52-9025-9efbe0e30901",
            }
        })

        expect(env.FOOTBALL_DATA_API_KEY).toBeDefined();
        fetchMock
            .get("http://api.football-data.org")
            .intercept({
                path: RegExp(String.raw`/v4/competitions/\d+/teams`),
                headers: {
                    'X-Auth-Token': env.FOOTBALL_DATA_API_KEY,
                }
            })
            .reply(200, {
                competition: {name: 'League Name'},
                teams: [{
                    id: 81,
                    name: 'Team 1',
                }],
            })
            .times(5);
        const settingsResponse = await SELF.fetch(
            "http://example.com/trmnl/settings?uuid=674c9d99-cea1-4e52-9025-9efbe0e30901",
        )
        expect(settingsResponse.status).toBe(200)
        const settingsHtml = await settingsResponse.text()
        expect(settingsHtml).toContain('<form class="form" action="/trmnl/settings/update" method="POST">')
        expect(settingsHtml).toContain('select name="teamId" class="input" required')
        expect(settingsHtml).toContain('<input type="hidden" name="uuid" value="674c9d99-cea1-4e52-9025-9efbe0e30901" />')
        expect(settingsHtml).toContain('<optgroup label="League Name">')
        expect(settingsHtml).toContain('<option value="81">Team 1</option>')

        const submitResponse = await SELF.fetch(
            "http://example.com/trmnl/settings/update",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'teamId=81&uuid=674c9d99-cea1-4e52-9025-9efbe0e30901',
                redirect: 'manual',
            }
        )
        expect(submitResponse.status).toBe(302)
        expect(submitResponse.headers.get('Location')).toBe('/trmnl/teams/81')
    });
});
