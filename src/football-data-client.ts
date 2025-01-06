import {fetchJson} from "./fetchJson";
import {getEnv} from "./globals";

export interface MatchesApiResponse {
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

export interface Match {
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

export interface Team {
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

export interface StandingsApiResponse {
    filters: {
        season: string;
    };
    area: {
        id: number;
        name: string;
        code: string;
        flag: string;
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
        winner: null | string;
        stages: string[];
    };
    standings: Array<{
        stage: string;
        type: string;
        group: null | string;
        table: Array<{
            position: number;
            team: Team;
            playedGames: number;
            form: string;
            won: number;
            draw: number;
            lost: number;
            points: number;
            goalsFor: number;
            goalsAgainst: number;
            goalDifference: number;
        }>;
    }>;
}

export async function fetchTeamMatches(teamId: number): Promise<Match[]> {
    let finishedGamesPath =
        `v4/teams/${teamId}/matches?status=FINISHED&limit=5`;
    const data = await fetchFootballDataJson<MatchesApiResponse>(finishedGamesPath)
    data.matches.reverse();
    return data.matches;
}

const baseUrl = 'http://api.football-data.org'

async function fetchFootballDataJson<T>(path: String): Promise<T> {
    const url = `${baseUrl}/${path}`;
    return await fetchJson<T>(url, {
        headers: {
            'X-Auth-Token': getEnv().FOOTBALL_DATA_API_KEY
        }})
}

export async function fetchStandings(competitionId: number) {
    const standingsPath = `v4/competitions/${competitionId}/standings`
    return await fetchFootballDataJson<StandingsApiResponse>(standingsPath)
}
