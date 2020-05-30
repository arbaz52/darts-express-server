var mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/dartsv3")
module.exports = mongoose