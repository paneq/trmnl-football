import {Column, Columns, Full} from "./trml";
import {formatScore} from "./formatScore";
import {fetchTeamMatches} from "./football-data-client";

export async function fetchAndRenderTeamMatches(teamId: number) {
    const matches = await fetchTeamMatches(teamId);
    return (
        <Full>
            <Columns>
                <Column>
                    <MatchesList matches={matches}/>
                </Column>
            </Columns>
        </Full>
    )
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


