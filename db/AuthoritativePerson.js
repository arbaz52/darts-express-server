var mongoose = require('./connection')
var Schema = mongoose.Schema

var AuthoritativePerson = new Schema({
    email: {
        type: String,
        required: true
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