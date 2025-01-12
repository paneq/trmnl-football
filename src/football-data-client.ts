import {fetchJson} from "./fetchJson";
import {getEnv} from "./globals";
import {getOrSet} from "./kv";

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

export interface TeamsApiResponse {
    count: number;
    filters: {
        season: string;
    };
    competition: Competition;
    season: Season;
    teams: Team[];
}

export interface Team {
    area: Area;
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
    address: string;
    website: string;
    founded: number;
    clubColors: string;
    venue: string;
    runningCompetitions: Competition[];
    coach: Coach;
    squad: Player[];
    staff: Record<string, never>;
    lastUpdated: string;
}

interface Area {
    id: number;
    name: string;
    code: string;
    flag: string;
}

interface Competition {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string | null;
}

interface Season {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: string | null;
}

interface Coach {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
    dateOfBirth: string;
    nationality: string;
    contract: {
        start: string;
        until: string;
    };
}

interface Player {
    id: number;
    name: string;
    position: string;
    dateOfBirth: string;
    nationality: string;
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

export async function fetchStandings(competitionId: number): Promise<StandingsApiResponse> {
    const standingsPath = `v4/competitions/${competitionId}/standings`
    return await fetchFootballDataJson<StandingsApiResponse>(standingsPath)
}

export async function fetchLeagueTeams(competitionId: number): Promise<TeamsApiResponse> {
    return await getOrSet<TeamsApiResponse>(
        getEnv().KV,
        `teams-${competitionId}`,
        async () => {
            const teamPath = `v4/competitions/${competitionId}/teams`
            return await fetchFootballDataJson<TeamsApiResponse>(teamPath)
        },
        {expirationTtl: 60 * 60 * 24}
    )
}
