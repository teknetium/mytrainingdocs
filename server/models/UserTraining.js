/*
 |--------------------------------------
 | UserTraining Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userTrainingSchema = new Schema({
  _id: { type: String, required: true },
  tid: { type: String, required: true },
  uid: { type: String, required: true },
  status: { type: String, required: true },
  dueDate: { type: number, required: true },
  timeToDate: { type: Number, required: true }
})

module.exports = mongoose.model("UserTraining", userTrainingSchema);
