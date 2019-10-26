/*
 |--------------------------------------
 | User Model
 |--------------------------------------
 */


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: { type: String, required: true },
  uid: { type: String, required: false },
  userType: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  org: { type: String, required: false },
  userStatus: { type: String, required: false },
  trainingStatus: { type: String, required: false },
  directReports: [String],
  myTrainings: [String],
  profilePicUrl: String,
  supervisor: String,
  tags: [String],
});

module.exports = mongoose.model("User", userSchema);
