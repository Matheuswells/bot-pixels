const { Schema } = require("mongoose");
const verificationSchema = new Schema({
  user: String,
  wallet: String,
  createdAt: Date,
  updatedAt: Date,
});

module.exports = verificationSchema;
