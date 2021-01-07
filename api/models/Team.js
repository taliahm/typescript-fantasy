const mongoose = require('mongoose');
const { Schema } = mongoose;
// TO DO: you are here!!!!!!
const episodeSchema = new Schema({
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  airDate: Date,
  number: Number,
  episodeId: {
    type: Schema.Types.ObjectId,
    ref: "Episode"
  }
});
const teamSchema = new Schema({
  id: Schema.Types.ObjectId,
  league: {
    type: Schema.Types.ObjectId,
    ref: "League",
  },
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  // },
  name: String,
  userName: String,
  userPic: String,
  episodes: [episodeSchema],
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;