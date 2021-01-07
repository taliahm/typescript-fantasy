import { PlayerNormalized, Player, Episode, Score, PlayerWithEpisodes } from '../types/player';

import { TeamWithPlayers } from '../types/team';   


const organizeEpisodes = (scores: Score[]): Episode => {
    const newObject = scores.reduce<Episode>((accum, curr) => {
        const episodeNumber = curr.episodeNumber;
        if (!accum[`episodeNumber${episodeNumber}`]) {
        accum[`episodeNumber${episodeNumber}`] = [curr];
        } else {
        accum[`episodeNumber${episodeNumber}`].push(curr);
        }
        return accum;
    }, {});
    return newObject;
}
export const normalizeEpisodes = (players: Player[], leagueId: string): PlayerWithEpisodes[] => {
    const thePlayers = players.map((player) => {
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
    const isEliminated = !!player.scores.find(s => s.eliminated);
    const sorted = arrayOfEps.sort((a, b) => {
        const episodeA = a[0].episodeNumber;
        const episodeB = b[0].episodeNumber;
        if (episodeA > episodeB) return 1;
        if (episodeA < episodeB) return -1;
        return 0;
    })
    return { ...player, organizedEps: sorted, isEliminated };
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

// this is bad, this should be done on the DB level, with an unwind or something, this seems not great:
export const playersInLeagueNotTaken = (teams: TeamWithPlayers[], currentTeamId: string | null, episodeId: string | undefined): Player[] => {
    const otherUsersTeams = teams.filter(t => {
        return t._id !== currentTeamId});

    const players: Player[] = otherUsersTeams.reduce<Player[]>((acc, team) => {
        team.episodes.forEach(epi => {
            epi.players.forEach(p => {
                acc.push(p);
            })
        })
        return acc;
    }, [])
    console.log(players);
    return players;
}
