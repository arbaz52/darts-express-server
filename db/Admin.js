var mongoose = require('./connection')
var Schema = mongoose.Schema

let validateEmail = (email) => {
    re = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    return re.test(email)
}

var Admin = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [
            validateEmail, "Invalid email"
        ]
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
        required: true,
        ref: "Person"
    }
})

var sch = mongoose.model("Admin", Admin)
module.exports = sch