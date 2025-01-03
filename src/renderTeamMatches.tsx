import {Full} from "./trml";
import {fetchJson} from "./fetchJson";

interface MatchesApiResponse {
    filters: {
        competitions?: string;
        permission: string;
        limit: number;
    };
    resultSet: {
        count: number;
        competitions?: string;
        first: string;
        last: string;
        played: number;
        wins: number;
        draws: number;
        losses: number;
    };
    matches: Match[];
}

interface Match {
    area: {
        id: number;
        name: string;
        code: string;
        flag: string | null;
    };
    competition: {
        id: number;
        name: string;
        code: string;
        type: string;
        emblem: string;
    };
    season: {
        id: number;
        startDate: string;
        endDate: string;
        currentMatchday: number;
        winner: string | null;
        stages: string[];
    };
    id: number;
    utcDate: string;
    status: string;
    minute: number | null;
    venue: string | null;
    stage: string;
    group: string | null;
    homeTeam: Team;
    awayTeam: Team;
    score: {
        winner: string | null;
        duration: string;
        fullTime: {
            home: number | null;
            away: number | null;
        };
        halfTime: {
            home: number | null;
            away: number | null;
        };
    };
}

interface Team {
    id: number | null;
    name: string | null;
    shortName: string | null;
    tla: string | null;
    crest: string | null;
    coach: {
        id: number | null;
        name: string | null;
        nationality: string | null;
    };
    formation: string | null;
}

export async function fetchAndRenderTeamMatches(teamId: number, env) {
    const matches = await fetchTeamMatches(teamId, env);
    return (
        <Full>
            <MatchesList matches={matches} />
        </Full>
    )
}
export async function fetchTeamMatches(teamId: number, env): Promise<Match[]> {
    const data = await fetchJson<MatchesApiResponse>(`http://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&limit=5`, {
        headers: {
            'X-Auth-Token': env.FOOTBALL_DATA_API_KEY
        }
    });
    data.matches.reverse();
    return data.matches;
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
