const mongoose = require('mongoose');
const { Schema } = mongoose;

const bcrypt = require('bcryptjs');
const { simpleRuleSchema } = require('./ruleSchema');

// USER
// firstName, lastName, email, password
// teams -> players, name, ruleSet


const teamSchema = new Schema({
  id: Schema.Types.ObjectId,
  league: {
     type: Schema.Types.ObjectId,
     ref: "League",
  },
  // ruleSet: [simpleRuleSchema],
  name: String,
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
  ], //embed the player ids here
});

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: {
    type: String,
    select: false,
  },
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }]
  // teams: [teamSchema],
});

userSchema.pre('save', async function(next) {
  const user = this;
  try {
    if (user.isModified('password') || user.isNew) {
      const encryptedPassword = await bcrypt.hash(user.password, 10);
      user.password = encryptedPassword;
    }
    next();
  } catch(e) {
    next(e);
  }
});

userSchema.methods.comparePasswords = function(password) {
  const user = this;
  return bcrypt.compare(password, user.password);
}


const User = mongoose.model("User", userSchema);

module.exports = User;


// HOW TO YOU UPDATE A SCORE ON A PLAYER???
// 