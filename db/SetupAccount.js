var mongoose = require('./connection')
var Schema = mongoose.Schema

var SetupAccount = new Schema({
    accountType: {
        type: String,
        required: true
    },
    accountId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    passCode: {
        type: String,
        required: true
    }
})

SetupAccount.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});


var sch = mongoose.model("SetupAccount", SetupAccount)
module.exports = sch