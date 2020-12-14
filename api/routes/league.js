const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const { isLoggedIn } = require('../middleware');
const League = require("../models/League");
const Team = require('../models/Team');
const User = require("../models/User");
const Player = require('../models/Players');
//'api/league'

// Get a specific league.
// todo: add gating so only users in the league can retrieve it.
router.get('/:leagueId', isLoggedIn, async (req, res) => {
    const { leagueId } = req.params;
    try {
      const league = await League.findById(leagueId).populate("users");
      // {seasons: {$in: [ObjectId("5fa306ffcd21f61bcc9e464b")]}}
      const seasonId = league.season;
      const playersInSeason = await Player.find({
        seasons: { $in: [ mongoose.Types.ObjectId(seasonId) ] },
      });

      const teams = await Team.find({ league: leagueId}).populate('players');

      res.json({league, playersInSeason, teams});
    } catch (e) {
        console.log(e);
    }
})

router.get('/search/:term', async (req, res) => {
    try {
        const { term } = req.params;
        const leagues = await League.find({ leagueName: { $regex: term, $options: 'i' }});
        res.json(leagues);
    } catch(e) {
        console.log(e)
    }
})
// Gated routes
// Create a league with a given user
router.post('/', isLoggedIn, async (req, res) => {
    const { leagueName, rules, seasonId, useCustomScores } = req.body;
    const userId = req.user._id;
    try {
      const league = new League({
        leagueName,
        users: [userId],
        rules,
        seasons: [seasonId],
        useCustomScores,
      });
      const doc = await league.save();
      const team = new Team({
          userName: req.user.firstName,
          name: '',
          players: [],
          league: doc._id,
      })
      const newTeam = await team.save();
      const user = await User.findById(req.user._id);
      user.teams.push(newTeam._id);
      await user.save();
      res.json(doc);
    } catch (e) {
      console.log(e);
    }
})

// Add user to a league.......
router.patch('/:leagueId', isLoggedIn, async (req, res) => {
    const { leagueId } = req.params;
    try {
        const inLeague = req.user.teams.filter((t) => {
            return t.league._id === leagueId
        })
        if (inLeague.length !== 0) {
            res.status(400).json({message: 'already in league'})
            return;
        }
        const league = await League.findById(leagueId);
        // const user = await User.findById(userId);
        const user = req.user;
        const userId = user._id;
        league.users.push(userId);
        await league.save();
        const team = new Team({
            league: leagueId,
            players: [],
            name: '',
            userName: req.user.firstName,
        })
        await team.save();
        user.teams.push(team._id);
        await user.save();
        await User.populate(user, {
            path: 'teams',
            populate: {
                path: 'league'
            }
        })
        res.json(user);
    } catch (e) {
        console.log(e);
    }
})

// Get players already chosen in league


module.exports = router;
