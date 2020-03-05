/*
 |--------------------------------------
 | User Training Session Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var utSessionSchema = new Schema({
  _id: { type: String, required: true },
  utId: { type: String, required: true },
  uid: { type: String, required: true },
  tid: { type: String, required: true },
  startTime: { type: Number, required: true },
  stopTime: { type: Number, required: true },
})

module.exports = mongoose.model("UTSession", utSessionSchema);
