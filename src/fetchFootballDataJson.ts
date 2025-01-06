import {fetchJson} from "./fetchJson";
import {getEnv} from "./globals";
export async function fetchFootballDataJson<T>(path: String): Promise<T> {
    const url = `http://api.football-data.org/${path}`;
    return await fetchJson<T>(url, {
        headers: {
            'X-Auth-Token': getEnv().FOOTBALL_DATA_API_KEY
    }})
}
