/*
 |--------------------------------------
 | User Model
 |--------------------------------------
 */


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userBulkAddSchema = new Schema({
  _id: { type: String, required: true },
  org: { type: String, required: true },
  status: { type: String, required: false },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true },
  jobTitle: { type: String, required: false },
  supervisorId: { type: String, required: false },
  supervisorName: { type: String, required: false },
});

module.exports = mongoose.model("UserBulkAdd", userBulkAddSchema);
