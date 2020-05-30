var mongoose = require('./connection')
var Schema = mongoose.Schema

var Server = new Schema({
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    //stream live footage of cameras from here
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})

var sch = mongoose.model("Server", Server)
module.exports = sch