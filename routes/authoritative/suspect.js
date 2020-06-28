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


router.get("/search/:query", async(req, res) => {
    try {
        var query = req.params.query
        var rx = new RegExp(query, 'i')
        var fFullName = await Suspect.find({
            fullName: rx
        })
        var fGender = await Suspect.find({
            gender: rx
        })
        var fTags = await Suspect.find({
            tags: rx
        })
        suspects = []
        var arrays = [fFullName, fGender, fTags]
        arrays.forEach(array => {
            array.forEach(suspect => {
                var add = true
                suspects.forEach(s => {
                    if (s._id.equals(suspect._id)) {
                        add = false
                    }
                })
                if (add)
                    suspects.push(suspect)
            })
        })
        res.json({
            succ: {
                message: "Search results for query: '" + query + "'"
            },
            suspects
        })
    } catch (err) {
        res.json({ err })
    }
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
    let suspect_id = req.params.suspect_id
    let suspect = req.body.suspect
    delete suspect._id
    delete suspect.__v
    console.log(suspect)
    Suspect.findByIdAndUpdate(suspect_id, {
        $set: suspect
    }, function(err, data) {
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
            // let suspect = data
            suspect._id = suspect_id
            if (!data.pictures) {
                suspect.pictures = []
            }

            res.json({
                suspect: suspect,
                succ: {
                    message: "Suspect Information updated!"
                }
            })
        }
    })
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
    console.log("deleting suspect from database")
    var suspect_id = req.params.suspect_id
    Suspect.findByIdAndRemove(suspect_id, async function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            var suspectId = suspect_id
            console.log("deleting alerts of this suspect from database")
            var alertIds = []
            var alerts = await Alert.find({ suspectId })
            alerts.forEach(alert => {
                alertIds.push(alert._id)
            })
            console.log("Deleting these alerts: " + alertIds)
            await Alert.deleteMany({
                suspectId
            })


            res.json({
                succ: {
                    message: "Suspect successfully removed!"
                }
            })
        }
    })
})

module.exports = router