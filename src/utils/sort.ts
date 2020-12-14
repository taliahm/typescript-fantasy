import { PlayerNormalized, Player, Episode, Score, PlayerWithEpisodes } from '../types/player';

import { TeamWithPlayers } from '../types/team';   


const organizeEpisodes = (scores: Score[]): Episode => {
    const starter: Episode = {};
    const newObject = scores.reduce((accum, curr) => {
        const episodeNumber = curr.episodeNumber;
        if (!accum[`episodeNumber${episodeNumber}`]) {
        accum[`episodeNumber${episodeNumber}`] = [curr];
        } else {
        accum[`episodeNumber${episodeNumber}`].push(curr);
        }
        return accum;
    }, starter);
    return newObject;
}
export const normalizeEpisodes = (players: Player[], leagueId: string): PlayerWithEpisodes[] => {
    const thePlayers = players.map((player) => {
    // const playerScores = player.scores;
    const playerScores = player.scores.filter((sc) => {
      return sc.leagueId === leagueId;
    });
    const isEliminated = player.scores.find(s => s.eliminated);
    const newObject = organizeEpisodes(playerScores);
    return { ...player, isEliminated: !!isEliminated, sortedScores: newObject };
    }).sort((x, y) => {
        return x.isEliminated === y.isEliminated ? 0 : x.isEliminated ? 1 : -1;
    });
    return thePlayers;
}


export const normalizePlayer = (player: Player): PlayerNormalized => {
    const organizedEps = organizeEpisodes(player.scores);

    const arrayOfEps: Score[][] = [];
    for (let epi in organizedEps) {
        const episode = organizedEps[epi];
        arrayOfEps.push(episode);
    }
    const sorted = arrayOfEps.sort((a, b) => {
        const episodeA = a[0].episodeNumber;
        const episodeB = b[0].episodeNumber;
        if (episodeA > episodeB) return 1;
        if (episodeA < episodeB) return -1;
        return 0;
    })
    return { ...player, organizedEps: sorted };
}

export const normalizeTeamsInLeague = (players: Player[], teams: TeamWithPlayers[]) => {
    const teamNormalized = teams.map((team) => {
        const teamPlayers = players.filter(p => {
            return team.players.find(tp => tp._id === p._id)
        });
        return {
          teamName: team.name,
          user: team.userName,
          players: teamPlayers,
        };
    })
    return teamNormalized;
}

export const playersInLeagueNotTaken = (teams: TeamWithPlayers[], currentTeamId: string | null): Player[] => {
    const otherUsersTeams = teams.filter(t => {
        return t._id !== currentTeamId});
    const players: Player[] = otherUsersTeams.reduce((acc, team) => {
        team.players.forEach(p => {
            acc.push(p);
        })
        return acc;
    }, [])

    return players;
}
