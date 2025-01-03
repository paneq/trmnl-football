import {Full} from "./trml";

export async function fetchAndRenderTeamMatches(teamId, env) {
    const matches = await fetchTeamMatches(teamId, env);
    return (
        <Full>
            <MatchesList matches={matches} />
        </Full>
    )
}

export async function fetchTeamMatches(teamId, env) {
    const response = await fetch(`http://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&limit=5`, {
        headers: {
            'X-Auth-Token': env.FOOTBALL_DATA_API_KEY
        }
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json()
    data.matches.reverse()
    return data.matches;
}

interface Match {
    homeTeam: { name: string };
    awayTeam: { name: string };
    competition: { name: string };
    score: { fullTime: { home: number; away: number } };
    utcDate: string;
}

export const MatchItem: React.FC<{ match: Match }> = ({ match }) => (
    <div className="item">
        <div className="meta"></div>
        <div className="content">
     <span className="title title--small">
       {match.homeTeam.name} vs {match.awayTeam.name}
     </span>
            <span className="description">{match.competition.name}</span>
            <div className="flex gap--small">
       <span className="label label--small label--underline">
         {match.score.fullTime.home} - {match.score.fullTime.away}
       </span>
                <span className="label label--small label--underline">
         {new Date(match.utcDate).toLocaleDateString()}
       </span>
            </div>
        </div>
    </div>
);

export const MatchesList: React.FC<{ matches: Match[] }> = ({ matches }) => (
    <>
    {matches.map((match, index) => (
        <MatchItem key={index} match={match} />
    ))}
    </>
);
