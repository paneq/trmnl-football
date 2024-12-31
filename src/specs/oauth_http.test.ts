import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { getMiniflareFetchMock } from '@miniflare/shared'

// Simple in-memory KV implementation
class InMemoryKV implements KVNamespace {
    private store: Map<string, string> = new Map()

    async get(key: string): Promise<string | null> {
        return this.store.get(key) ?? null
    }

    async put(key: string, value: string): Promise<void> {
        this.store.set(key, value)
    }
}

describe('OAuth flow', async () => {
    let worker: UnstableDevWorker
    let fetchMock: ReturnType<typeof getMiniflareFetchMock>

    beforeAll(async () => {
        // Setup fetch mocking
        fetchMock = getMiniflareFetchMock()
        fetchMock.disableNetConnect()

        // Mock the TRMNL OAuth endpoint
        const trmnlOrigin = fetchMock.get('https://usetrmnl.com')
        trmnlOrigin
            .intercept({
                method: 'POST',
                path: '/oauth/token'
            })
            .reply(200, {
                access_token: 'test-access-token',
            })

        const mockEnv = {
            TRMNL_CLIENT_ID: 'test-client-id',
            TRMNL_CLIENT_SECRET: 'test-client-secret',
            KV: new InMemoryKV(),
        }

        worker = await unstable_dev('src/index.ts', {
            experimental: { disableExperimentalWarning: true },
            vars: mockEnv,
        })
    })

    afterAll(async () => {
        await worker.stop()
    })

    it('should handle successful OAuth flow', async () => {
        const callbackUrl = 'https://example.com/callback'
        const response = await worker.fetch(
            `/trmnl/oauth/new?code=test-code&installation_callback_url=${encodeURIComponent(callbackUrl)}`
        )

        expect(response.status).toBe(302)
        expect(response.headers.get('Location')).toBe(callbackUrl)
    })
})
