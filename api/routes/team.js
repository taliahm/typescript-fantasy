const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Team = require('../models/Team');
const { isLoggedIn } = require("../middleware");
const { getPlayersByLeague } = require("../controllers/players");

// /team
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
  console.log(req.user);
  // get teams in league
  const { leagueId } = req.params;
  const teams = await Team.find({ league: mongoose.Types.ObjectId(leagueId )});
  // get players and figure out who wins!
  const players = await getPlayersByLeague(leagueId);
  
  const playersWithScores = players.map((p => {
    let sum = 0;
    const epiTotal = p.scores.reduce((accum, curr) => {

      return accum + curr.pointValue * (curr.count || 0);
    }, 0);
    sum = epiTotal + sum;
    console.log(sum, 'SUM');
    return {...p, totalPoints: sum}
  }))
  // point is for front end to be able to easily display teams in winning order. 
  const teamsWithTotals = teams.map((team) => {
    let teamTotal = 0;
    const withPointsPlayers = team.players.map(player => {
      const foundPlayer = playersWithScores.find(pl => {
        return pl._id.equals(player._id)})
        // console.log(foundPlayer, 'FOUNT PLAYER');
      teamTotal = teamTotal + foundPlayer.totalPoints;
      return foundPlayer;
    })
    const isCurrentUserTeam = req.user.teams.find(t => t._id.equals(team._id));
    console.log(!!isCurrentUserTeam);
    return {
      isCurrentUserTeam,
      league: team.league,
      name: team.name,
      players: withPointsPlayers,
      _id: team._id,
      userName: team.userName,
      teamTotal,
    };
  })
  const sorted = teamsWithTotals.sort((a, b) => b.teamTotal - a.teamTotal)
  // console.log(teamsWithTotals);
  res.json({ sorted });
})


module.exports = router;