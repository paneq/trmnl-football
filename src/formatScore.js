export function formatScore(score) {
    const homeTeam = score.regularTime?.home ?? score.fullTime.home;
    const awayTeam = score.regularTime?.away ?? score.fullTime.away;

    // Regular time finish
    if (score.duration === 'REGULAR') {
        return `${homeTeam}:${awayTeam}`;
    }

    // Extra time finish
    if (score.duration === 'EXTRA_TIME') {
        const finalHome = homeTeam + (score.extraTime?.home || 0);
        const finalAway = awayTeam + (score.extraTime?.away || 0);
        return `${finalHome}:${finalAway} (aet)`;
    }

    // Penalty shootout
    if (score.duration === 'PENALTY_SHOOTOUT') {
        const finalHome = homeTeam + (score.extraTime?.home || 0);
        const finalAway = awayTeam + (score.extraTime?.away || 0);
        const finalScoreStr = `${finalHome}:${finalAway}`;
        const penaltiesStr = `${score.penalties.home}-${score.penalties.away}`;
        return `${finalScoreStr} (${penaltiesStr})`;
    }

    return 'Invalid score data';
}
