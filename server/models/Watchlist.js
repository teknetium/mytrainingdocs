/*
 |--------------------------------------
 | TrainingComment Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const watchlistSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  listName: { type: String, required: false },
  items: { type: [String], required: true },
  ownerId: { type: String, required: true },
  createDate: { type: Number, required: true },
})

module.exports = mongoose.model("Watchlist", watchlistSchema);
