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
  email: { type: String, required: false },
  teamId: { type: String, required: false },
  adminUp: Boolean,
  jobs: [String],
  userStatus: { type: String, required: false },
  trainingStatus: { type: String, required: false },
  directReports: [String],
  profilePicUrl: String,
  supervisorId: String,
});

module.exports = mongoose.model("User", userSchema);
