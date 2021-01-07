const mongoose = require("mongoose");
const { Schema } = mongoose;


const episodeSchema = new Schema({
  number: Number,
  airDate: Date,
  prevAirDate: Date,
  season: {
    type: Schema.Types.ObjectId,
    ref: "Season",
  }, //REF TO SEASON ID!!!!!
});

const Episode = mongoose.model("Episode", episodeSchema);

module.exports = Episode;
