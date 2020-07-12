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

QRAuth.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

var sch = mongoose.model("QRAuth", QRAuth)
module.exports = sch