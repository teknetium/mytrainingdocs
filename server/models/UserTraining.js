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
  trainingVersion: { type: String, required: false },
  status: { type: String, required: true },
  dueDate: { type: Number, required: false },
  timeToDate: { type: Number, required: false },
  dateCompleted: { type: Number, required: false },
  notificationDates: { type: [Number], required: false},
  assessmentResponse: { type: [Number], required: false }
})

module.exports = mongoose.model("UserTraining", userTrainingSchema);
