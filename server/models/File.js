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
  teamId: { type: String, required: true},
  description: { type: String, required: false },
  iconClass: { type: String, required: true },
  iconType: { type: String, required: true },
  iconColor: { type: String, required: true },
  iconSource: { type: String, required: true },
  versions: [
    {
      _id: String,
      version: String,
      fileName: { type: String, required: true },
      size: { type: String, required: false },
      mimeType: { type: String, required: false },
      changeLog: String,
      owner: String,
      fsHandle: String,
      url: String,
      safeUrl: String,
      dateUploaded: Number
    }],
})

module.exports = mongoose.model("File", fileSchema);
