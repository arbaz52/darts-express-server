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
        personId: {
            type: Schema.Types.ObjectId,
            required: true
        }
    }]
})

var sch = mongoose.model("QRUnit", QRUnit)
module.exports = sch