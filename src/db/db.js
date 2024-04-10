// connect to mongo db and export the connection
const mongoose = require('mongoose');
const { mongoUri } = require('../config/db.json');
mongoose.connect(mongoUri, { });
module.exports = mongoose.connection;