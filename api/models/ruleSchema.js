const mongoose = require('mongoose');
const { Schema } = mongoose;

const ruleSchema = new Schema({
  pointValue: Number,
  text: String,
  episodeNumber: Number,
  count: Number,
  id: Schema.Types.ObjectId,
  leagueId: Schema.Types.ObjectId,
  total: Number,
  eliminated: {
    type: Boolean, 
    default: false,
  },
  global: {
    type: Boolean,
    default: false,
  }
});

const simpleRuleSchema = new Schema({
  pointValue: Number,
  text: String,
  id: Schema.Types.ObjectId,
});

module.exports = {
    ruleSchema,
    simpleRuleSchema
};