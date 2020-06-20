var mongoose = require('./connection')
var Schema = mongoose.Schema

var QRAuth = new Schema({
    QRUnitId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    key: {
        type: String,
        required: true
    }
})

var sch = mongoose.model("QRAuth", QRAuth)
module.exports = sch