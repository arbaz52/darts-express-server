var mongoose = require('./connection')
var Schema = mongoose.Schema

let validateEmail = (email) => {
    re = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    return re.test(email)
}

var AuthoritativePerson = new Schema({
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
    personId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Person"
    },
    privileges: {
        type: [String],
        required: true
    }
})

var sch = mongoose.model("AuthoritativePerson", AuthoritativePerson)
module.exports = sch