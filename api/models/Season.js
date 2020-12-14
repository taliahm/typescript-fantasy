const mongoose = require("mongoose");
const { Schema } = mongoose;


const seasonSchema = new Schema({
    seasonNumber: Number,
    name: String,
    episodes: Number,
})

// Connect schema to collection
const Season = mongoose.model("Season", seasonSchema);

module.exports = Season;

// Get all the players in season 1
// findALL players with season ID x

// Add scoring for season 1 player Tanya epi 3, 
// update player id with season id and push into scores array or UPDATE by rule id
