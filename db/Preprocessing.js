var mongoose = require('./connection')
var Schema = mongoose.Schema


var Preprocessing = new Schema({
    cameraId: {
        type: Schema.Types.ObjectId,
        ref: "cameraId",
        required: true
    },
    //0 is black, 0.5 original
    brightness: {
        type: Number
    },
    //+ve value -> sharper
    sharpness: {
        type: Number,
    },
    //greater value, greater denoising, but cpu-intensive and blurs the image
    denoise: {
        type: Number,
    }
})

Preprocessing.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

var sch = mongoose.model("Preprocessing", Preprocessing)
module.exports = sch