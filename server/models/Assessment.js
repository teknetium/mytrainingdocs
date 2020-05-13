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


module.exports = mongoose.model("Assessment", assessmentSchema);
