/**
 * Gets a JSON value from KV store or sets it if it doesn't exist
 * @param namespace The KV namespace to operate on
 * @param key The key to get or set
 * @param fallback A function that returns the value to set if the key doesn't exist
 * @param options KV options including expiration and metadata
 * @returns The value from KV or the result of the fallback function
 */
export async function getOrSet<T>(
    namespace: KVNamespace,
    key: string,
    fallback: () => Promise<T>,
    options: Partial<KVNamespacePutOptions> = {}
): Promise<T> {
    const cachedValue = await namespace.get(key, { type: 'json' } as KVNamespaceGetOptions<'json'>);

    if (cachedValue !== null) {
        return cachedValue as T;
    }

    const newValue = await fallback();
    await namespace.put(
        key,
        JSON.stringify(newValue),
        options
    );

    return newValue as T;
}
