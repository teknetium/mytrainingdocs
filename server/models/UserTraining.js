/*
 |--------------------------------------
 | UserTraining Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notifyEventSchema = new Schema ({
  date: { type: Number, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  recipient: { type: String, required: false }
})

const assessmentResponseSchema = new Schema({
  uid: { type: String, required: true },
  tid: { type: String, required: true },
  passed: { type: Boolean, required: false },
  completed: { type: Boolean, required: false },
  assessmentId: { type: String, required: false },
  score: { type: Number, required: false },
  executionDate: { type: Number, required: false },
  answers: { type: [Number], required: false },
  isFinal: { type: Boolean, required: false }
})

const userTrainingSchema = new Schema({
  _id: { type: String, required: true },
  tid: { type: String, required: true },
  uid: { type: String, required: true },
  teamId: { type: String, required: true },
  trainingVersion: { type: String, required: false },
  status: { type: String, required: true },
  dueDate: { type: Number, required: false },
  notifySchedule: [notifyEventSchema],
  timeToDate: { type: Number, required: false },
  dateCompleted: { type: Number, required: false },
  assessmentResponses: [assessmentResponseSchema],
  certImage: {
    name: { type: String },
    mimeType: { type: String },
    fileStackId: { type: String },
    fileStackUrl: { type: String },
    dateUploaded: { type: Number }
  }
})

module.exports = mongoose.model("UserTraining", userTrainingSchema);
