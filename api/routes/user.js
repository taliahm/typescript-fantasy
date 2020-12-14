const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

const User = require("../models/User");

const { createToken } = require('../tokenService');
const { isLoggedIn } = require('../middleware');
// /api/user

// Create a user and reply with token/user
router.post('/', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });
    try {
      const foundUser = await User.findOne({ email });
      if (foundUser) {
        res.status(400).json({ message: `email ${email} already exists` });
        return;
      }
      const doc = await user.save();
      const token = createToken({ id: doc._id });
      res.cookie("token", token);
      delete doc.password;
      res.json(doc);
    } catch (e) {
      console.log(e);
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
        res.status(400).json({ message: `email ${email} already exists` });
        return;
        }
        const isMatch = await user.comparePasswords(password);
        if (!isMatch) {
        res.status(400).json({ message: "password or email not valid" });
        return;
        }
        const token = createToken({ id: user._id });
        res.cookie("token", token);
        res.status(200).send({});
    } catch (e) {
        console.log(e);
    } 
})

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).send({});
})


// GATED routes
// Add player to a team
// router.patch('/team/:teamId', isLoggedIn, async (req, res) => {
//     console.log("patching?");
//     // db.collection.update(
//     //   { "friends.u.username": "michael" },
//     //   { $set: { "friends.$.u.name": "hello" } }
//     // );
//     // Player.findOne({ _id: playerId, scores: {$elemMatch: { episodeNumber: epNumber, _id: ruleId } } })
//     const { players, name } = req.body;
//     // if (!userId) {
//     //     res.status(400).json({ message: "need a user id" });
//     //     return;
//     // }
//     const { teamId } = req.params;
    
//     if (teamId === 'null' || !teamId) {
//         console.log('in here?');
//         res.status(400).json({ message: 'need time ID'});
//         return;
//     }
//     // get league
//     // get all teams in league
//     // if player is in one of those teams, nah
//     try {
//         const update = await User.findOneAndUpdate(
//         {
//             _id: mongoose.Types.ObjectId(req.user._id),
//             teams: { $elemMatch: { _id: mongoose.Types.ObjectId(teamId) } },
//         },
//         {
//             $set: { "teams.$.name": name, "teams.$.players": players },
//         }
//         );
//         res.json(update);
//     } catch (e) {
//         console.log(e);
//         res.status(500).send({ message: e })
//     }
// })


module.exports = router;