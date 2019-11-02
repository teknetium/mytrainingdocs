/*
 |--------------------------------------
 | Training Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const trainingSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  teamId: { type: String, required: true },
  owner: { type: String, required: true },
  dateCreated: { type: Number, required: true },
  estimatedTimeToComplete: { type: Number, required: true },
  description: { type: String, required: true },
  introduction: { type: String, required: false },
  introductionLabel: { type: String, required: false },
  execSummary: { type: String, required: false },
  execSummaryLabel: { type: String, required: false },
  goals: { type: String, required: false },
  goalsLabel: { type: String, required: false },
  image: { type: String, required: false },
  iconClass: { type: String, required: true },
  iconColor: { type: String, required: true },
  iconSource: { type: String, required: true },
  execSummary: { type: String, required: false },
  sections: [{
    _id: { type: String, required: true },
    title: { type: String },
    intro: { type: String },
    file: { type: String },
  }],
  tags: [String],
  assessment: {
    questions: [{
      question: String,
      choices: [String],
      answer: [Number]
    }]
  }
});

module.exports = mongoose.model("Training", trainingSchema);
