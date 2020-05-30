var router = require("express").Router()
var Suspect = require("./../../db/Suspect")
var multer = require("multer")


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
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
router.put("/:suspect_id/picture", upload.single("picture"), function(req, res) {
    let suspect_id = req.params.suspect_id
    Suspect.findByIdAndUpdate(suspect_id, {
            $push: { pictures: "http://localhost:3000/images/" + req.file.filename }
        },
        function(err, d) {
            if (err) {
                res.json({
                    err: err
                })
            } else if (d) {

                res.json({
                    succ: {
                        message: "Picture added succesfully!",
                        suspect: d
                    }
                })
            }
        }
    )
})




//delete
router.delete("/:suspect_id", function(req, res) {

})

module.exports = router