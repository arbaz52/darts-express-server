var mongoose = require('./connection')
var Schema = mongoose.Schema

var Alert = new Schema({
    suspectId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Suspects"
    },
    cameraId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Cameras"
    },
    frame_url: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    }
})

var sch = mongoose.model("Alert", Alert)
module.exports = sch