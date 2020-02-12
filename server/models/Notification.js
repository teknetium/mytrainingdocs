/*
 |--------------------------------------
 | Notification Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  _id: { type: String, required: true },
  tid: { type: String, required: true },
  uid: { type: String, required: true },
  trainingVersion: { type: String, required: false },
  status: { type: String, required: true },
  dueDate: { type: Number, required: false },
  timeToDate: { type: Number, required: false },
  score: { type: Number, required: false },
  dateCompleted: { type: Number, required: false },
  passedAssessment: { type: Boolean, required: false },
  assessmentResponse: { type: [Number], required: false }
})

module.exports = mongoose.model("UserTraining", userTrainingSchema);
