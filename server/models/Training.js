/*
 |--------------------------------------
 | Training Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const versionSchema = new Schema({
  _id: { type: String, required: true },
  changeLog: { type: String, required: false },
  dateUploaded: { type: Number, required: false },
  version: { type: String },
  file: {
    _id: { type: String },
    name: { type: String },
    mimeType: { type: String },
    fileStackId: { type: String },
    fileStackUrl: { type: String },
    dateUploaded: { type: Number}
  },
  webUrl: { type: String },
  safeWebUrl: { type: String },
  text: { type: String },
})

const contentSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: false },
  versions: [versionSchema]
})

const pageSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String },
  intro: { type: String },
  icon: { type: String, required: false },
  content: [contentSchema],
})



const trainingSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  versions: [
    {
      _id: String,
      version: String,
      pending: Boolean,
      changeLog: String,
      ownerId: String,
      dateCreated: Number,
      title: String,
      iconClass: String,
      iconColor: String,
    }],
  status: { type: String, required: true },
  category: { type: String, required: false },
  subcategory: { type: String, required: false },
  title: { type: String, required: true },
  teamId: { type: String, required: true },
  owner: { type: String, required: true },
  dateCreated: { type: Number, required: true },
  estimatedTimeToComplete: { type: Number, required: true },
  jobTitle: { type: String, required: false },
  description: { type: String, required: true },
  image: { type: String, required: false },
  iconClass: { type: String, required: true },
  iconColor: { type: String, required: true },
  iconSource: { type: String, required: true },
  pages: [pageSchema],
  interestList: [String],
  shared: { type: Boolean },
  isValid: { type: Object },
  isDirty: { type: Boolean },
});

module.exports = mongoose.model("Training", trainingSchema);
