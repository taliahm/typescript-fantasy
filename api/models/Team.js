const mongoose = require('mongoose');
const { Schema } = mongoose;


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
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;