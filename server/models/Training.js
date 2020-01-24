/*
 |--------------------------------------
 | Training Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const portletSchema = new Schema({
    _id: { type: String, required: true },
    file: { type: String },
    width: { type: Number },
    height: { type: Number },
    xLoc: { type: Number },
    yLoc: { type: Number }
})

const pageSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String },
  file: { type: String },
  intro: { type: String },
  portlets: [portletSchema],
})

const assessmentSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  timeLimit: { type: Number, required: false },
  passingGrade: { type: Number, required: false },
  items: [
    {
      question: { type: String },
      choices: { type: [String] },
      correctChoice: { type: Number }
    }
  ]
})


const trainingSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  version: { type: String, required: true },
  status: { type: String, required: true },
  title: { type: String, required: true },
  teamId: { type: String, required: true },
  owner: { type: String, required: true },
  dateCreated: { type: Number, required: true },
  estimatedTimeToComplete: { type: Number, required: true },
  jobTitle: { type: String, required: false },
  description: { type: String, required: true },
  image: { type: String, required: false },
  introductionLabel: { type: String, required: false },
  introduction: { type: String, required: false },
  execSummaryLabel: { type: String, required: false },
  execSummary: { type: String, required: false },
  goalsLabel: { type: String, required: false },
  goals: { type: String, required: false },
  iconClass: { type: String, required: true },
  iconColor: { type: String, required: true },
  iconSource: { type: String, required: true },
  files: [String],
  pages: [pageSchema],
  useAssessment: { type: Boolean },
  assessment: assessmentSchema,
  rating: [Number],
  interestList: [String]
});

module.exports = mongoose.model("Training", trainingSchema);
