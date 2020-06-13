/*
 |--------------------------------------
 | Assessment Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assessmentSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: false },
  title: { type: String, required: true },
  owner: { type: String, required: true },
  description: { type: String, required: true },
  timeLimit: { type: Number, required: false },
  passingGrade: { type: Number, required: false },
  isFinal: { type: Boolean, required: false },
  items: [
    {
      question: { type: String },
      choices: { type: [String] },
      extraInfo: { type: [String] },
      correctChoice: { type: Number }
    }
  ]
})


module.exports = mongoose.model("Assessment", assessmentSchema);
