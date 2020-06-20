var mongoose = require("mongoose")
    // mongoose.connect("mongodb://localhost:27017/dartsv3")
const uri = "mongodb://arbaz:1234@cluster0-shard-00-00-2g7zp.mongodb.net:27017,cluster0-shard-00-01-2g7zp.mongodb.net:27017,cluster0-shard-00-02-2g7zp.mongodb.net:27017/dartsv3?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("MongoDB Connected")
    })
    .catch(err => console.log(err))

module.exports = mongoose