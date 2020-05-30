var mongoose = require('./connection')
var Schema = mongoose.Schema

var Person = new Schema({
    fullName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    }
})
var sch = mongoose.model("Person", Person)
module.exports = sch
