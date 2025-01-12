import { describe, it, expect } from 'vitest';
import { env } from "cloudflare:test";

import { getOrSet } from '../kv';

describe('getOrSet', () => {
    const TEST_NAMESPACE = env.KV;

    it('should set and return new value when key does not exist', async () => {
        const testData = { test: 'data' }

        const result = await getOrSet(
            TEST_NAMESPACE,
            'test-key',
            async () => testData
        );

        expect(result).toEqual(testData)
    });

    it('should return existing value without calling fallback with new data', async () => {
        const initialData = { test: 'initial' }
        const newData = { test: 'new' }

        const initial = await getOrSet(
            TEST_NAMESPACE,
            'cached-key',
            async () => initialData
        );
        const cached = await getOrSet(
            TEST_NAMESPACE,
            'cached-key',
            async () => newData
        );

        expect(initial).toEqual(initialData);
        expect(cached).toEqual(initialData);
        expect(cached).not.toEqual(newData);
    });

    it('should allow passing expiration options', async () => {
        const firstData = { test: 'first' };
        const secondData = { test: 'second' };

        const first = await getOrSet(
            TEST_NAMESPACE,
            'expiring-key',
            async () => firstData,
            { expirationTtl: 60 }
        );

        const second = await getOrSet(
            TEST_NAMESPACE,
            'expiring-key',
            async () => secondData,
            { expirationTtl: 60 }
        );

        expect(first).toEqual(firstData);
        expect(second).toEqual(firstData);
    });

    it('should handle metadata in options', async () => {
        const testData = { test: 'metadata' };
        const metadata = { updated: 'now' };

        const result = await getOrSet(
            TEST_NAMESPACE,
            'metadata-key',
            async () => testData,
            { metadata }
        );

        const { value, metadata: storedMetadata } = await TEST_NAMESPACE.getWithMetadata('metadata-key', { type: 'json' });
        expect(result).toEqual(testData);
        expect(value).toEqual(testData);
        expect(storedMetadata).toEqual(metadata);
    });

    it('should handle errors in fallback function', async () => {
        await expect(getOrSet(
            TEST_NAMESPACE,
            'error-key',
            async () => {
                throw new Error('Fallback failed');
            }
        )).rejects.toThrow('Fallback failed');
    });
});
