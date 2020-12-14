const mongoose = require("mongoose");
const { Schema } = mongoose;

const { ruleSchema } = require('./ruleSchema');

const playerSchema = new Schema({
  firstName: String,
  lastName: String,
  scores: [ruleSchema],
  seasons: [
    {
      type: Schema.Types.ObjectId,
      ref: "Season",
    },
  ], //REF TO SEASON ID!!!!!
});

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;


// Player 
// ruleSet: [{ score, count, epiNum, text, season }],