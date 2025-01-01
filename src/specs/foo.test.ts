import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
    fetchMock,
    SELF
} from "cloudflare:test";
import { describe, it, expect, beforeAll, afterEach } from "vitest";

describe("OAuth Handler", () => {
    // Setup fetch mocking
    beforeAll(() => {
        fetchMock.activate();
        fetchMock.disableNetConnect();
    });

    // Clear all mocks after each test
    afterEach(() => {
        // fetchMock.resetHandlers();
    });

    it("successfully exchanges code for token and redirects", async () => {
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
            });

        // const ctx = createExecutionContext();
        const response = await SELF.fetch(
            "http://example.com/trmnl/oauth/new?code=test-code&installation_callback_url=https://callback.example.com",
            {redirect: 'manual'}
        );

        // await waitOnExecutionContext(ctx);

        // Verify redirect
        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe("https://callback.example.com/");

        // Optionally verify the KV storage if needed
        // const storedData = await env.KV.get("test-access-token");
        // expect(JSON.parse(storedData)).toEqual({ user: null });
    });
});
