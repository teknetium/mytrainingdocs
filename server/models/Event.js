/*
 |--------------------------------------
 | Event Model
 |--------------------------------------
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const eventSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  userId: { type: String, required: true },
  teamId: { type: String, required: false },
  orgId: { type: String, required: false },
  desc: { type: String },
  mark: {
    iconClass: { type: String, required: true },
    iconColor: { type: String, required: true },
    useBadge: { type: Boolean, required: true },
    badgeColor: { type: String, required: true }
  },
  creationDate: { type: Number, required: true },
  actionDate: { type: Number, required: true },
})

module.exports = mongoose.model("Event", eventSchema);
