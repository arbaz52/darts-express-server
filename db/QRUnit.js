var mongoose = require('./connection')
var Schema = mongoose.Schema

var QRUnit = new Schema({
    name: {
        type: String,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Person"
    }]
})


QRUnit.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});



var sch = mongoose.model("QRUnit", QRUnit)
module.exports = sch