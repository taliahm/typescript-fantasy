const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Team = require('../models/Team');
const { isLoggedIn } = require("../middleware");
const { getPlayersByLeague, getPlayersWithEpisodeTotals } = require("../controllers/players");


router.patch('/episode/:teamId', isLoggedIn, async (req, res) => {
  console.log('this one?');
  const { players, airDate, number, episodeId } = req.body;
  const { teamId } = req.params;
    if (teamId === "null" || !teamId) {
      res.status(400).json({ message: "need time ID" });
      return;
    }
    try {
      // Find by episode and update players if exists, 
      const doc = await Team.findOne({
        _id: teamId,
        episodes: {$elemMatch: {airDate: airDate, number: number, episodeId: episodeId }}
      })
      console.log(doc);
      if (!doc) {
        const newEpisode = {
          players: players,
          airDate,
          number,
          episodeId,
        }
        await Team.updateOne(
          { _id: teamId },
          {$push: {episodes: newEpisode }}
        )
        const updated = await Team.findOne({id: teamId });
        res.json(updated);
        return;
      } else {
        const updated = await Team.findOneAndUpdate({ _id: teamId, episodes: {$elemMatch: { episodeId: episodeId }} }, {
          $set: {'episodes.$.players': players }
        })
        res.json(updated);
      }
    } catch(e) {
      console.log(e);
    }
})

// /team
// Possibly outdated now in favour of episodes model:
router.patch('/:teamId', isLoggedIn, async (req, res) => {
  const { players, name } = req.body;
  const { teamId } = req.params;

    if (teamId === "null" || !teamId) {
      res.status(400).json({ message: "need time ID" });
      return;
    }

    try {
      const update = await Team.findOneAndUpdate(
        { _id: teamId },
        {
          $set: { "name": name, "players": players },
        }
      );
      res.json(update);
    } catch(e) {
      console.log(e);
      res.status(500).send({ message: e });
    }
})

router.get('/:leagueId', isLoggedIn, async (req, res) => {
  // get teams in league
  const { leagueId } = req.params;
  const teams = await Team.find({ league: mongoose.Types.ObjectId(leagueId )});
  // get players and figure out who wins!
  const players = await getPlayersByLeague(leagueId);

  const playersWithScores = players.map((p => {
    let sum = 0;
    const perEpisode = p.scores.reduce((accum, curr) => {
      const { episodeNumber } = curr;
      if (!accum[episodeNumber]) {
        accum[episodeNumber] = curr.total;
        return accum;
      } else {
        accum[episodeNumber] = accum[episodeNumber] + curr.total;
        return accum;
      }
    }, {})
    const epiTotal = p.scores.reduce((accum, curr) => {

      return accum + curr.pointValue * (curr.count || 0);
    }, 0);
    sum = epiTotal + sum;
    return {...p, totalPoints: sum, pointsByEpisode: perEpisode}
  }))
  // point is for front end to be able to easily display teams in winning order. 
  const teamsWithTotals = teams.map((team) => {
    if (!team.episodes) {
      return;
    }

    const episodesWithPoints = team.episodes.map(epi => {
      const episodeWithPoints = {number: epi.number, id: epi._id};
      let episodeTotal = 0;
      const players = [];
      epi.players.forEach((player) => {
        const foundPlayer = playersWithScores.find((pl) => {
          return pl._id.equals(player._id);
        });
        const byEpisode = foundPlayer.pointsByEpisode[`${epi.number}`] || 0;
        players.push(foundPlayer);
        episodeTotal = episodeTotal + byEpisode;
      })
      
      episodeWithPoints.total = episodeTotal;
      episodeWithPoints.players = players;
      return episodeWithPoints;
    })
    const isCurrentUserTeam = req.user.teams.find(t => t._id.equals(team._id));
    const teamTotal = episodesWithPoints.reduce((accum, curr) => { return accum + curr.total}, 0)
    return {
      isCurrentUserTeam: !!isCurrentUserTeam,
      league: team.league,
      name: team.name,
      // players: withPointsPlayers,
      _id: team._id,
      userName: team.userName,
      userPic: team.userPic,
      teamTotal,
      episodes: episodesWithPoints,
    };
  })
  const sorted = teamsWithTotals.sort((a, b) => b.teamTotal - a.teamTotal)
  // console.log(teamsWithTotals);
  res.json({ sorted });
})


module.exports = router;