var mongoose = require('./connection')
var Schema = mongoose.Schema
var uniqueValidator = require("mongoose-unique-validator")
let validateLength = (v) => {
    return v.length > 2;
}

var Person = new Schema({
    fullName: {
        type: Schema.Types.String,
        required: true,
        // unique: true,
        trim: true,
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


Person.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

// Person.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique; {VALUE} already exists!' })

var sch = mongoose.model("Person", Person)
module.exports = sch