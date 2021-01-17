/*
 |--------------------------------------
 | TrainingComment Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orgSchema = new Schema({
  _id: { type: String, required: true },
  domain: { type: String, required: true },
  adminIds: { type: [String], required: true },
  owner: { type: String, required: true },
  plan: { type: String, required: true },
  createDate: { type: Number, required: true },
  userCount: { type: Number, required: true },
})

module.exports = mongoose.model("Org", orgSchema);
