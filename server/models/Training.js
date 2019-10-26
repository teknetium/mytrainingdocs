/*
 |--------------------------------------
 | Training Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  question: String,
  choices: [String],
  answer: Number
});

var AssessmentSchema = new Schema({
  questions: [QuestionSchema]
});



const trainingSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  teamId: { type: String, required: true },
  owner: { type: String, required: true },
  dateCreated: { type: Number, required: true },
  estimatedTimeToComplete: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
  iconClass: { type: String, required: true },
  iconColor: { type: String, required: true },
  iconSource: { type: String, required: true },
  sections: {
    title: { type: String },
    intro: { type: String },
    files: { type: [String] },
    assessment: AssessmentSchema
  },
  tags: [String],
  assessment: AssessmentSchema,
  });

module.exports = mongoose.model("Training", trainingSchema);
