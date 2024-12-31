export async function handleSettingsUpdate(c) {
    const user_uuid = c.req.body('uuid');
    if (!user_uuid) {
        return c.text('UUID is required', 400);
    }

    const userData = await c.env.KV.get(user_uuid);
    if (!userData) {
        return c.text('User not found', 404);
    }

    const teamId = c.req.body('teamId');
    if (!teamId) {
        return c.text('Team ID is required', 400);
    }

    await c.env.KV.put(user_uuid, JSON.stringify({ ...userData, teamId }));

    return c.text('Settings updated');
}
