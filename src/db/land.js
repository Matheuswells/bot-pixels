const { Schema } = require("mongoose");
const landSchema = new Schema({
  land: String,
  trees: Array,
  treesTimestamp: Array,
  updatedAt: Date,
  door: String,
});

module.exports = landSchema;
