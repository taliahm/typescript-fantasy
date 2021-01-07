const mongoose = require('mongoose');
const Players = require('../models/Players');

// this only works if they have scores in the league......
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

// This does not work......
exports.getPlayersWithEpisodeTotals = async (leagueId) => {
  // get e
  // const docs = await Players.aggregate([
  //   {$match: {seasons: { $in: [mongoose.Types.ObjectId("5fa306ffcd21f61bcc9e464b")]}}},
  //   {$unwind: {path: "$scores"}},
  //   {$group: {_id: "$scores.episodeNumber", sum: {$sum: "$scores.total"}}},
  //   {$replaceRoot: {
  //     newRoot: {
  //       $mergeObjects: ["$$ROOT", "$scores"]
  //     }
  //   }}
    
  //   // {$project: "total"},
  //   // {$project: {"_id": "$_id", "entries": "$entries", "total": {$multiply: []}}}
  // ]);
  const docs = await Players.aggregate([
    {$unwind: "$scores"},
    {$group: {
      "_id": {
        "_id": "$_id",
        "episodeNumber": "$scores.episodeNumber",
        "scoreThings": {"$filter": {input: "$scores", as: "score", cond: {$eq: ["$$score.episodeNumber", "$episodeNumber"]}}}
      },
      "scoreFull": {"$push": "$scores"}

    }},
    {$group: {
      "_id": "$_id._id",
      "scoreFull": {"$push": "$scoreThings"}
    }}
  ])
  // console.log(docs, 'HELLLOOOO YOUUUUUUUUUU');
  docs.forEach(d => {
    console.log(d);
  })
}
// episodeNumber: "$scores.episodeNumber";
//  entries: { $push: "$scores"}, sum: {$sum: "$scores.total"}}},