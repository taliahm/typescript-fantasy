const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Player = require('../models/Players');
const { getPlayersByLeague } = require('../controllers/players');

// api/players

// un-gated routes
router.get('/:playerId', async (req, res) => {
    const { playerId } = req.params;
    const { leagueId } = req.query;
    try {
        const doc = await Player.findById(playerId);
        if (leagueId) {
            const filteredScores = doc.scores.filter(sc => sc.leagueId.toString() === leagueId);
            doc.scores = filteredScores;
            const isEliminated = doc.scores.find(s => s.eliminated);
            res.json({
                scores: doc.scores,
                isEliminated: !!isEliminated,
                seasons: doc.seasons,
                firstName: doc.firstName,
                lastName: doc.lastName,
                _id: doc._id
            })
            return;
        }
        res.json(doc);
    } catch (e) {
        console.log(e);
    }
})

router.get('/', async (req, res) => {
    const { leagueId } = req.query;
    try {
        if (!leagueId) {
            const docs = await Player.find();
            res.json(docs);
            return;
        }

        const docs = await getPlayersByLeague(leagueId);
        res.json(docs);
    } catch (e) {
        console.log(e);
    }
})

router.post('/', async (req, res) => {
    const { firstName, lastName } = req.body;
    const player = new Player({
      firstName,
      lastName,
      scores: [],
      seasons: ["5fa306ffcd21f61bcc9e464b"],
    });
    const created = await player.save();
    res.json({player: created})

})

// GLOBAL SCORE UPDATE
// NEED to gate this!!
router.post('/global/score', async (req, res) => {
    const { playerId, ruleId, epNumber, pointValue, text } = req.body;

    const score = {
      _id: ruleId,
      episodeNumber: epNumber,
      pointValue: pointValue,
      text,
      global: true,
      leagueId: null,
    };

    try {
        const doc = await Player.findOne({
            _id: playerId,
            scores: { $elemMatch: { episodeNumber: epNumber, _id: ruleId, global: true } },
        });

        if (!doc) {
            score.count = 1;
            await Player.updateOne(
                { _id: playerId },
                { $push: { scores: score } }
            );
            const updated = await Player.findOne({ _id: playerId });
            res.json(updated);
            return;
        } else {
            const toUpdate = doc.scores.filter((s) => {
                return (
                s._id.toString() === ruleId &&
                s.episodeNumber === parseInt(epNumber) &&
                s.global === true
                );
            })[0];
            const newScores = doc.scores.filter((s) => {
                //   WORRIED ABOUT THIS but I think it's better now:
                return (
                s._id.equals(ruleId) !== true &&
                s.episodeNumber !== epNumber &&
                s.global === true
                );
            });
            toUpdate.count = toUpdate.count + 1;
            newScores.push(toUpdate);
            doc.scores = newScores;

            const thing = await doc.save();
            res.json(doc);
        }
    } catch(e) {
        console.log(e);
    }
})

router.post('/score', async (req, res) => {
    const { playerId, ruleId, epNumber, pointValue, text, leagueId } = req.body;

    const score = {
      _id: ruleId,
      episodeNumber: epNumber,
      pointValue: pointValue,
      text,
      leagueId,
    };
    // find a score that already exists and update count
    try {
        // Try to find the player:
        // Where ruleId and epNumber exists in the same score array.....
        const doc = await Player.findOne({
            _id: playerId,
            scores: { $elemMatch: { episodeNumber: epNumber, _id: ruleId, leagueId: leagueId } },
        });

        if (!doc) {
        // OR push a new score into the scores array
        score.count = 1;
        score.total = 1 * pointValue;
        await Player.updateOne(
            { _id: playerId },
            { $push: { scores: score } }
        );
        const updated = await Player.findOne({ _id: playerId });
        res.json(updated);
        return;
        } else { 
            const toUpdate = doc.scores.filter((s) => {
                return (
                s._id.toString() === ruleId &&
                s.episodeNumber === parseInt(epNumber) &&
                s.leagueId.toString() === leagueId
                );
            })[0];

            const newScores = doc.scores.filter((s) => {
                return toUpdate._id !== s._id;
            });

            toUpdate.count = toUpdate.count + 1;
            toUpdate.total = toUpdate.count * toUpdate.pointValue;
            newScores.push(toUpdate);
            doc.scores = newScores;

            const thing = await doc.save();
            res.json(thing);
        }
    } catch (e) {
        console.log(e);
    }
})

router.post('/', async (req, res) => {
    const player = new Player({
        firstName: "Lauren",
        lastName: "Kimberlan",
        seasons: ["5fa306ffcd21f61bcc9e464b"],
        episodes: [],
    });
    try {
        const doc = await player.save();
        res.json(doc);
    } catch (e) {
        console.log(e);
    }
})

router.post('/eliminated', async (req, res) => {
      const {
        playerId,
        ruleId,
        epNumber,
        pointValue,
        text,
        leagueId,
        eliminated,
      } = req.body;

      const score = {
        _id: ruleId,
        episodeNumber: epNumber,
        pointValue: pointValue,
        text,
        leagueId,
      };
    if (eliminated) {
        score.eliminated = true;
        await Player.updateOne(
             { _id: playerId },
             { $push: { scores: score } }
        );
        const players = await getPlayersByLeague(leagueId);
        res.json(players);
        return;
    } else {
        const updated = await Player.updateOne(
           { _id: playerId, scores: { $exists: true } },
           { $pull: { scores: {eliminated: true }  } },
           { multi: true }
         );
        const players = await getPlayersByLeague(leagueId);
        res.json(players);
    }
})

module.exports = router;