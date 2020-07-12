var mongoose = require('./connection')
var Schema = mongoose.Schema

var Suspect = new Schema({
    fullName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    pictures: {
        required: false,
        type: [String]
    },
    tags: {
        required: true,
        type: [String]
    }
})

Suspect.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});


var sch = mongoose.model("Suspect", Suspect)
module.exports = sch