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
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: false },
  teamId: { type: String, required: false },
  adminUp: Boolean,
  jobTitle: String,
  userStatus: { type: String, required: false },
  trainingStatus: { type: String, required: false },
  profilePicUrl: String,
  supervisorId: String,
});

module.exports = mongoose.model("User", userSchema);
