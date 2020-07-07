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

    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },


    frame_url: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },

    //for qrunits
    qrunit: {
        type: Schema.Types.ObjectId,
        ref: "QRUnits",
        required: false
    },
    started_handling: {
        type: Date,
        required: false
    },

    //when closed
    closed_alert: {
        type: Date,
        required: false
    },
    reason: {
        type: String,
        required: false
    }
})

var sch = mongoose.model("Alert", Alert)
module.exports = sch