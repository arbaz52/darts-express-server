var mongoose = require('./connection')
var Schema = mongoose.Schema

var Admin = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    privileges: {
        type: [String],
        required: true
    },
    personId: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

var sch = mongoose.model("Admin", Admin)
module.exports = sch