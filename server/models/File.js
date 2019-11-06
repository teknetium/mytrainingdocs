/*
 |--------------------------------------
 | File Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var fileSchema = new Schema();
fileSchema.add({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, required: false },
  mimeType: { type: String, required: false },
  teamId: { type: String, required: true},
  description: { type: String, required: false },
  versions: [{version: String, changeLog: String, owner: String, fsHandle: String, url: String, dateUploaded: Number}],
  iconClass: { type: String, required: true },
  iconType: { type: String, required: true },
  iconColor: { type: String, required: true },
  iconSource: { type: String, required: true }
})

module.exports = mongoose.model("File", fileSchema);
