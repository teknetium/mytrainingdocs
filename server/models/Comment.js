/*
 |--------------------------------------
 | Event Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  _id: { type: String, required: true },
  tid: { type: String, required: true },
  author: { type: String, required: true },
  avatar: { type: String, required: false  },
  content: { type: String, required: true },
  date: { type: Number, required: true }
})

module.exports = mongoose.model("Comment", eventSchema);
