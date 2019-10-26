/*
 |--------------------------------------
 | Training Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  label: { type: String, required: true },
  color: { type: String, required: true },
  org: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  });

module.exports = mongoose.model("Tag", tagSchema);
