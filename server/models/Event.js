/*
 |--------------------------------------
 | Event Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  teamId: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true },
  creationDate: { type: Number, required: true },
  actionDate: { type: Number, required: true },
})

module.exports = mongoose.model("Event", eventSchema);
