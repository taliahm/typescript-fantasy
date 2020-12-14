const mongoose = require("mongoose");
const { Schema } = mongoose;

// const { ruleSchema } = require("./ruleSchema");
const { simpleRuleSchema } = require("./ruleSchema");

const leagueSchema = new Schema({
  leagueName: String,
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  rules: [simpleRuleSchema],
  // ONLY ONE!!!!!!!!!!!!
  useCustomScores: {
    type: Boolean,
    default: true,
  },
  season: 
    {
      type: Schema.Types.ObjectId,
      ref: "Season",
    }, //REF TO SEASON ID!!!!!
});

const League = mongoose.model("League", leagueSchema);

module.exports = League;

