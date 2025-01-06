import {Full} from "./trml";
import {fetchFootballDataJson} from "./fetchFootballDataJson";
import {formatScore} from "./formatScore";

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
            <MatchesList matches={matches}/>
        </Full>
    )
}

export async function fetchTeamMatches(teamId: number, env): Promise<Match[]> {
    let finishedGamesUrl =
        `v4/teams/${teamId}/matches?status=FINISHED&limit=5`;
    const data = await fetchFootballDataJson<MatchesApiResponse>(finishedGamesUrl)
    data.matches.reverse();
    return data.matches;
}

export const MatchItem: React.FC<{ match: Match }> = ({match}) => (
    <div className="item">
        <div className="meta"></div>
        <div className="content">
             <span className="title">
               {match.homeTeam.name} vs {match.awayTeam.name}
             </span>
            <span className="title title--small">
                {formatScore(match.score)}
            </span>
            <span className="label label--small label--underline">
                {match.competition.name}, {new Date(match.utcDate).toLocaleDateString()}
            </span>
        </div>
    </div>
);

export const MatchesList: React.FC<{ matches: Match[] }> = ({matches}) => (
    <>
        {matches.map((match, index) => (
            <MatchItem key={index} match={match}/>
        ))}
    </>
);


