export async function handleSettingsUpdate(c) {
    const formData = await c.req.parseBody();
    const userUuid = formData.uuid;
    const teamId = formData.teamId;

    if (!userUuid) {
        return c.text('UUID is required', 400);
    }
    if (!teamId) {
        return c.text('Team ID is required', 400);
    }

    const userData = await c.env.KV.get(userUuid);
    if (!userData) {
        return c.text('User not found', 404);
    }
    
    await c.env.KV.put(userUuid, JSON.stringify({ ...userData, teamId }));

    return c.text('Settings updated');
}
