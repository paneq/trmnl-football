function filterStandings(table, teamId) {
    // If 8 or fewer teams, return all
    if (table.length <= 8) {
        return table;
    }

    // Find our team's position (0-based index)
    const ourTeamIndex = table.findIndex(entry => entry.team.id === teamId);

    // If team not found, return first 8 teams
    if (ourTeamIndex === -1) {
        return table.slice(0, 8);
    }

    // If our team is in top 6, return first 8 teams
    if (ourTeamIndex <= 5) {
        return table.slice(0, 8);
    }

    // If our team is in last 3, return top 3 and last 5 teams
    if (ourTeamIndex > table.length -1 -2) {
        return [...table.slice(0, 3), ...table.slice(-5)];
    }

    // For in-between cases, return:
    // - Top 3 teams
    // - 2 teams above our team
    // - Our team
    // - 2 teams below our team

    const result = [];

    // Add top 3
    result.push(...table.slice(0, 3));

    const start = ourTeamIndex - 2
    const end = ourTeamIndex + 2 + 1
    result.push(...table.slice(start, end));
    return result
}

// Example usage:
// const standings = [/* your standings array */];
// const teamId = 65; // Example team ID
// const filteredStandings = filterStandings(standings, teamId);

export function renderTableStandings(data, teamId) {
    const standings = data.standings.find(
        standing => standing.type === 'TOTAL' && standing.stage === 'REGULAR_SEASON'
    );

    if (!standings || !standings.table) {
        return '<p>No standings data available</p>';
    }
    const filteredTable = filterStandings(standings.table, teamId);

    const tableHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th><span class="title">Pos</span></th>
                    <th><span class="title">Team</span></th>
                    <th><span class="title">MP</span></th>
                    <th><span class="title">W</span></th>
                    <th><span class="title">D</span></th>
                    <th><span class="title">L</span></th>
                    <th><span class="title">GF</span></th>
                    <th><span class="title">GA</span></th>
                    <th><span class="title">GD</span></th>
                    <th><span class="title">Pts</span></th>
                </tr>
            </thead>
            <tbody>
                ${filteredTable.map(team => `
                    <tr>
                        <td><span class="label">${team.position}</span></td>
                        <td><span class="label">${team.team.shortName}</span></td>
                        <td><span class="label">${team.playedGames}</span></td>
                        <td><span class="label">${team.won}</span></td>
                        <td><span class="label">${team.draw}</span></td>
                        <td><span class="label">${team.lost}</span></td>
                        <td><span class="label">${team.goalsFor}</span></td>
                        <td><span class="label">${team.goalsAgainst}</span></td>
                        <td><span class="label">${team.goalDifference}</span></td>
                        <td><span class="label">${team.points}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    return tableHTML;
}
