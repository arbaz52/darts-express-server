router = require("express").Router()

QRUnit = require("../../db/QRUnit")
Person = require("../../db/Person")


Admin = require("../../db/Admin")
AuthoritativePerson = require("../../db/AuthoritativePerson")

var multer = require("multer")

var qrcode = require("qrcode")
var md5 = require("md5")
var QRAuth = require("../../db/QRAuth")

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


//add a person if it does not exist
db = require("./../../fb/fb").db
bucket = require("./../../fb/fb").bucket

router.post("/person", upload.single("picture"), (req, res) => {
    var person = JSON.parse(req.body.person)
    person.picture_url = "http://localhost:3000/images/" + req.file.filename
    person.picture_url = "http://localhost:3000/images/" + req.file.filename
    frame = req.file.path
    blob = bucket.upload(frame, {}, (ur) => {
        console.log(ur)
    })

    frame_url = "https://storage.googleapis.com/fypqrf-b3259.appspot.com/" + req.file.filename
    person.picture_url = frame_url

    Person.create(person, (err, data) => {
        if (err) {
            console.error(err)
            res.json({ err })
        } else {
            res.json({
                succ: {
                    message: "Person added successfully!"
                },
                person: data
            })
        }
    })
})

//get list of all the available people
router.get("/person", async(req, res) => {
    people = await Person.find({})
        //check which ones are available (not in other QR Units)
    qrunits = await QRUnit.find({})

    //fill in this array
    free_people = []
    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        free_people.push(person)
    }

    //check if they're in another unit
    for (var i = 0; i < qrunits.length; i++) {
        for (var j = 0; j < qrunits[i].members.length; j++) {
            for (var k = 0; k < free_people.length; k++) {
                if (free_people[k]._id.equals(qrunits[i].members[j].personId)) {
                    free_people.splice(k, 1)
                }
            }
        }
    }
    //check if they're admin
    admins = await Admin.find({})
    console.log(admins)
    for (var i = 0; i < admins.length; i++) {
        for (var j = 0; j < free_people.length; j++) {
            if (free_people[j]._id.equals(admins[i].personId)) {
                free_people.splice(j, 1)
            }
        }
    }

    //check if they're authoritative personnel
    ap = await AuthoritativePerson.find({})
    console.log(ap)
    for (var i = 0; i < ap.length; i++) {
        for (var j = 0; j < free_people.length; j++) {
            if (free_people[j]._id.equals(admins[i].personId)) {
                free_people.splice(j, 1)
            }
        }
    }




    res.json({
        people: free_people,
        succ: {
            message: "Available People"
        }
    })
})

//add a qrunit
router.post("/", (req, res) => {
    var qrunit = req.body.qrunit
    qrunit.latitude = -1
    qrunit.longitude = -1
    console.log(qrunit);
    QRUnit.create(qrunit, async(err, data) => {
        if (err) {
            res.json({
                err
            })
        } else {
            //now create a one-time login
            var str = md5(data._id + " --- " + Date.now())
            var auth = await QRAuth.create({
                QRUnitId: data._id,
                key: str
            })
            qrcode.toFile("./public/images/" + auth._id, str)
            console.log(auth)
            res.json({
                succ: {
                    message: "QR Unit successfully created",

                },
                auth_id: auth._id
            })
        }
    })
})


//get all the qrunits
router.get("/", (req, res) => {

})


//update a qrunit
router.put("/:qrunitId", (req, res) => {

})

//delete a qrunit
router.delete("/:qrunitId", (req, res) => {

})

module.exports = router