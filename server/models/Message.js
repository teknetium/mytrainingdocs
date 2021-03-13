/*
 |--------------------------------------
 | Message Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  _id: { type: String, required: true },
  uid: { type: String, required: true },
  state: { type: String, required: false },
  category: { type: String, required: false },
  subCategory: { type: String, required: false },
  to: { type: String, required: true },
  from: { type: String, required: true },
  subject: { type: String, required: true },
  text: { type: String, required: false },
  html: { type: String, required: false },
  sentDate: { type: Number, required: false },
  receivedDate: { type: Number, required: false },
  mbox: { type: String, required: false },
  trainingId: { type: String, required: false },
  templateId: { type: String, required: false },
  dynamicTemplateData: { type: Object, required: false }
})

module.exports = mongoose.model("Message", messageSchema);
