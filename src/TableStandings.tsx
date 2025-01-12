interface Team {
    id: number;
    shortName: string;
}

interface TableEntry {
    position: number;
    team: Team;
    playedGames: number;
    won: number;
    draw: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
}

interface Standing {
    type: string;
    stage: string;
    table: TableEntry[];
}

interface StandingsData {
    standings: Standing[];
}

function filterStandings(table: TableEntry[], teamId: number): TableEntry[] {
    if (table.length <= 8) return table;

    const ourTeamIndex = table.findIndex(entry => entry.team.id === teamId);

    if (ourTeamIndex === -1) return table.slice(0, 8);
    if (ourTeamIndex <= 5) return table.slice(0, 8);
    if (ourTeamIndex > table.length - 1 - 2) {
        return [...table.slice(0, 3), ...table.slice(-5)];
    }

    const result: TableEntry[] = [];
    result.push(...table.slice(0, 3));

    const start = ourTeamIndex - 2;
    const end = ourTeamIndex + 2 + 1;
    result.push(...table.slice(start, end));
    return result;
}

interface TableStandingsProps {
    data: StandingsData;
    teamId: number;
    // variant can be 'regular' or 'compact'
    variant: 'regular' | 'compact';
}

export function TableStandings({ data, teamId, variant }: TableStandingsProps) {
    const standings = data.standings.find(
        standing => standing.type === 'TOTAL'
    );

    if (!standings?.table) {
        return <p>No standings data available</p>;
    }

    const filteredTable = filterStandings(standings.table, teamId);

    return (
        <table className="table">
            <thead>
            <tr>
                <th><span className="title">Pos</span></th>
                <th><span className="title">Team</span></th>
                <th><span className="title">MP</span></th>
                <th><span className="title">W</span></th>
                <th><span className="title">D</span></th>
                <th><span className="title">L</span></th>
                {variant === 'regular' && (
                    <>
                        <th><span className="title">GF</span></th>
                        <th><span className="title">GA</span></th>
                        <th><span className="title">GD</span></th>
                    </>
                )}
                <th><span className="title">Pts</span></th>
            </tr>
            </thead>
            <tbody>
            {filteredTable.map(team => (
                <tr key={team.team.id}>
                    <td><span className="label">{team.position}</span></td>
                    <td><span className="label">{team.team.shortName}</span></td>
                    <td><span className="label">{team.playedGames}</span></td>
                    <td><span className="label">{team.won}</span></td>
                    <td><span className="label">{team.draw}</span></td>
                    <td><span className="label">{team.lost}</span></td>
                    {variant === 'regular' && (
                        <>
                            <td><span className="label">{team.goalsFor}</span></td>
                            <td><span className="label">{team.goalsAgainst}</span></td>
                            <td><span className="label">{team.goalDifference}</span></td>
                        </>
                    )}
                    <td><span className="label">{team.points}</span></td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
