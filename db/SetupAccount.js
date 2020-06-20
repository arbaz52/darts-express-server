var mongoose = require('./connection')
var Schema = mongoose.Schema

var SetupAccount = new Schema({
    accountType: {
        type: String,
        required: true
    },
    accountId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    passCode: {
        type: String,
        required: true
    }
})

var sch = mongoose.model("SetupAccount", SetupAccount)
module.exports = sch