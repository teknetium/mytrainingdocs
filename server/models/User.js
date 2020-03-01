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
  email: { type: String, required: true },
  teamId: { type: String, required: false },
  org: { type: String, required: true },
  adminUp: { type: Boolean, required: false },
  jobTitle: { type: String, required: false },
  userStatus: { type: String, required: false },
  trainingStatus: { type: String, required: false },
  profilePicUrl: { type: String, required: false },
  supervisorId: { type: String, required: false },
  settings: { type: Object, required: false }
});

module.exports = mongoose.model("User", userSchema);
