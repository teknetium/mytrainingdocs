/*
 |--------------------------------------
 | Doc Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: false },
  intro: { type: String, required: false },
  paragraphs: [String],
  images: [String]
})


const docSchema = new Schema({
  _id: { type: String, required: true },
  productId: { type: String, required: true },
  productVersion: { type: String, required: true },
  author: { type: String, required: true },
  featureName: { type: String, required: true },
  sections: [sectionSchema],
  images: [String]
})

module.exports = mongoose.model("Doc", docSchema);
