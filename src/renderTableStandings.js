export function renderTableStandings(data) {
    const standings = data.standings.find(
        standing => standing.type === 'TOTAL' && standing.stage === 'REGULAR_SEASON'
    );

    if (!standings || !standings.table) {
        return '<p>No standings data available</p>';
    }

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
                ${standings.table.map(team => `
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
