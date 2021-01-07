const Episode = require('../models/Episode');
const express = require('express');
// const { isLoggedIn, requireRole } = require("../middleware");

const router = express.Router();
// To do: isLoggedIn, add super admin required role
router.post('/:seasonId', async (req, res) => {
  const { seasonId } = req.params;
  if (!seasonId) {
    res.status(400).json({ message: 'must provide season id'});
    return
  }
  try {
    const { airDate } = req.body;
     if (!airDate) {
       res.status(400).json({ message: "provide airDate" });
       return;
     }
    let nextNumber = 1;
    let prevAirDate = null;
    const mostRecent = await Episode.find().sort({airDate: -1}).limit(1)
    console.log(mostRecent);
    if (mostRecent.length !== 0) {
      nextNumber = mostRecent[0].number + 1;
      prevAirDate = mostRecent[0].airDate;
    }

    const newEpisode = new Episode({
      prevAirDate,
      airDate,
      number: nextNumber,
      season: seasonId,
    });

    console.log(newEpisode, 'new episode?');

    const doc = await newEpisode.save();
    res.json(doc);

  } catch(e) {
    console.log(e);
  }
})

// Get the next airing episode by passing a DATE as a query param
router.get('/:seasonId', async (req, res) => {
  const { seasonId } = req.params;
  const { date } = req.query;
  if (!seasonId) {
    res.status(400).json({ message: 'must provide season id'});
    return;
  }
  if (date) {
    try {
      const episode = await Episode.find({ season: seasonId, airDate: { $gte: date }}).sort({airDate: 1}).limit(1);
      console.log(episode);
      res.json({episode})
      return;
    } catch(e) {
      console.log(e);
    }
  }
  try {
    const episodes = await Episode.find({ season: seasonId}).sort({airDate: -1})
    res.json({episodes});
  } catch(e) {
    console.log(e);
  }
})

router.patch('/:episodeId', async (req, res) => {
  const { episodeId } = req.params;
  if (!episodeId) {
    res.status(400).json({message: 'provide episode id'});
    return
  }
  const { airDate } = req.body;
  try {
    const episode = await Episode.findById(episodeId);
    const prevEpisode = await Episode.findOne({ prevAirDate: airDate });
    episode.airDate = airDate;
    prevEpisode.prevAirDate = airDate;
    await episode.save();
    await prevEpisode.save();
    res.json({episode, prevEpisode});
  } catch (e) {
    console.log(e);
  }
})

module.exports = router;