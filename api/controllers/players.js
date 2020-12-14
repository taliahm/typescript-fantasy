const mongoose = require('mongoose');
const Players = require('../models/Players');

exports.getPlayersByLeague = async (leagueId) => {
  const docs = await Players.aggregate([
    {
      $project: {
        _id: 1,
        lastName: 1,
        firstName: 1,
        seasons: 1,
        scores: {
          $filter: {
            input: "$scores",
            as: "score",
            cond: {
              $eq: [
                "$$score.leagueId",
                mongoose.Types.ObjectId(leagueId),
              ],
            },
          },
        },
        global: 1,
        _id: 1,
        episodeNumber: 1,
        pointValue: 1,
        text: 1,
        count: 1,
      },
    },
  ]);
  return docs;
}