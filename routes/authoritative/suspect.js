var router = require("express").Router()
var Suspect = require("./../../db/Suspect")
var multer = require("multer")

var Alert = require("./../../db/Alert")

var path = require('path')
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({ storage: storage })


//CRUD Operations

//create
router.post("/", function(req, res) {

    var suspect = req.body.suspect

    suspect.pictures = []

    Suspect.create(suspect, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            res.json({
                succ: {
                    message: "Suspect successfully added!"
                },
                suspect: data
            })
        }
    })
})

//read
router.get("/", function(req, res) {

    Suspect.find({}, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            suspects = []
            for (let i = 0; i < data.length; i++) {
                let suspect = data[i]
                if (!data[i].pictures) {
                    suspect.pictures = []
                }
                suspects.push(suspect)
            }
            res.json({
                suspects: suspects
            })
        }
    })
})
router.get("/:suspect_id", function(req, res) {

    let suspect_id = req.params.suspect_id
    Suspect.findById(suspect_id, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else if (data == null) {
            res.json({
                err: {
                    message: "Suspect not found"
                }
            })
        } else {
            let suspect = data
            if (!data.pictures) {
                suspect.pictures = []
            }

            //loading track history
            //basically all the alerts generated when this suspect was detected by our system
            Alert

            res.json({
                suspect: suspect
            })
        }
    })
})


//update
router.put("/:suspect_id", function(req, res) {

})

//add picture
db = require("./../../fb/fb").db
bucket = require("./../../fb/fb").bucket
router.put("/:suspect_id/picture", upload.single("picture"), async function(req, res) {
    let suspect_id = req.params.suspect_id
    frame = req.file.path
    await bucket.upload(frame, {})

    frame_url = "https://storage.googleapis.com/fypqrf-b3259.appspot.com/" + req.file.filename

    Suspect.findByIdAndUpdate(suspect_id, {
            $push: { pictures: frame_url }
        },
        function(err, d) {
            if (err) {
                res.json({
                    err: err
                })
            } else {

                res.json({
                    succ: {
                        message: "Picture added succesfully!",
                    },
                    suspect: d,
                    frame_url: frame_url
                })
            }
        }
    )
})




//delete
router.delete("/:suspect_id", function(req, res) {

})

module.exports = router