var mongoose = require('./connection')
var Schema = mongoose.Schema

let validateLength = (v) => {
    return v.length > 2;
}

var Person = new Schema({
    fullName: {
        type: String,
        required: true,
        unique: true,
        validate: [
            validateLength, "Invalid fullname, should be more than 2 characters long"
        ]
    },
    gender: {
        type: String,
        required: true
    },
    picture_url: {
        type: String,
        required: true
    }
})
var sch = mongoose.model("Person", Person)
module.exports = sch