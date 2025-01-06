import {fetchJson} from "./fetchJson";
import {getEnv} from "./globals";

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

export async function fetchTeamMatches(teamId: number, env): Promise<Match[]> {
    let finishedGamesUrl =
        `v4/teams/${teamId}/matches?status=FINISHED&limit=5`;
    const data = await fetchFootballDataJson<MatchesApiResponse>(finishedGamesUrl)
    data.matches.reverse();
    return data.matches;
}

async function fetchFootballDataJson<T>(path: String): Promise<T> {
    const url = `http://api.football-data.org/${path}`;
    return await fetchJson<T>(url, {
        headers: {
            'X-Auth-Token': getEnv().FOOTBALL_DATA_API_KEY
        }})
}
