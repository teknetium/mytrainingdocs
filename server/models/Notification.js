/*
 |--------------------------------------
 | Notification Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  tid: { type: String, required: true },
  uid: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  iconSource: { type: String, required: true },
  fgColor: { type: String, required: true },
  bgColor: { type: String, required: true },
})

module.exports = mongoose.model("Notification", notificationSchema);
