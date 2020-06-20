var admin = require("firebase-admin");

var serviceAccount = require("./fypqrf-b3259-firebase-adminsdk-fgvqy-3c9d569f4c");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fypqrf-b3259.firebaseio.com"
});
db = admin.database()

const { Storage } = require("@google-cloud/storage")
storage = new Storage({
    projectId: "fypqrf-b3259",
    keyFilename: "fypqrf-b3259-4f9dd6b6524e.json"
})
var bucket = storage.bucket("fypqrf-b3259.appspot.com")

module.exports.db = db
module.exports.bucket = bucket