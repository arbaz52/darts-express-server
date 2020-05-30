var mongoose = require('./connection')
var Schema = mongoose.Schema

var Camera = new Schema({
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    serverId: {
        type: Schema.Types.ObjectId,
        required: false
    }
})

var sch = mongoose.model("Camera", Camera)
module.exports = sch