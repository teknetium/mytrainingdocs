/*
 |--------------------------------------
 | TrainingComment Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trainingCommentSchema = new Schema({
  _id: { type: String, required: true },
  tid: { type: String, required: true },
  version: { type: String, required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Number, required: true }
})

module.exports = mongoose.model("TrainingComment", trainingCommentSchema);
