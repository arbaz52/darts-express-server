var router = require("express").Router()

var QRUnit = require("../../db/QRUnit")
var mail = {}
mail.transport = require("./../../mailer/mailer").transport
mail.emailtemplate = require("./../../mailer/mailer").emailTemplate
var md5 = require("md5")
var SetupAccount = require("../../db/SetupAccount")
var multer = require("multer")

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



var Admin = require("../../db/Admin")
var Person = require("../../db/Person")
const { computeDestinationPoint } = require("geolib")
router.get("/", async(req, res) => {
    try {
        admins = await Admin.find({}, { password: 0 }).populate("personId")
        console.log(admins)

        res.json({
            succ: {
                message: "list of admins"
            },
            admins: admins
        })
    } catch (e) {
        console.error(e)
        res.json({
            err: e
        })

    }
})



//add a person if it does not exist

db = require("./../../fb/fb").db
bucket = require("./../../fb/fb").bucket

router.post("/person", upload.single("picture"), (req, res) => {
    var person = JSON.parse(req.body.person)
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
    try {
        people = await Person.find({})
            //check which ones are available (not in other QR Units)
        qrunits = await QRUnit.find({})
        console.log(people, qrunits)
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

                    if (free_people[k]._id.equals(qrunits[i].members[j])) {
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




        res.json({
            people: free_people,
            succ: {
                message: "Available People"
            }
        })
    } catch (ex) {
        console.log(ex)
        res.json({
            err: ex
        })

    }
})





router.get("/:adminId", async(req, res) => {
    var adminId = req.params.adminId
    try {
        admin = await Admin.findById(adminId, { password: 0 }).populate("personId")

        res.json({
            succ: {
                message: "admin details"
            },
            admin: admin
        })
    } catch (e) {
        console.error(e)
        res.json({
            err: e
        })

    }
})

function nDigitRandom(n) {
    r = ""
    for (var i = 0; i < n; i++) {
        r += Math.floor(Math.random() * 10)
    }
    return r
}
//create an admin
router.post("/", async(req, res) => {
    var admin = req.body.admin
    admin.password = "changeit"
    try {
        var admins = await Admin.find({
            email: admin.email
        })
        if (admins.length > 0) {
            res.json({
                err: {
                    message: "This email is already in use by another Admin!"
                }
            })
            return
        }
    } catch (err) {
        res.json({ err })
        return
    }



    Admin.create(admin, async(err, data) => {
        if (err) {
            console.error(err)
            res.json({ err })
        } else {
            var pc = nDigitRandom(4)
            setupAccount = await SetupAccount.create({
                    accountType: "admin",
                    accountId: data._id,
                    passCode: pc
                })
                //account created, let's email the user
            email = mail.emailtemplate
            email.to = admin.email
            email.subject = "DARTS - Setup your Admin account!"
            email.html = "<html>" +
                "Visit the following link to set a password for your account " +
                "<br/>Use this code to verify yourself: " + pc +
                "<br/>http://localhost:3000/setup/" + setupAccount._id +
                "</html>"
            mail.transport.sendMail(email)
            res.json({
                succ: {
                    message: "Admin created successfully! Notify the admin to check his/her email"
                }
            })
        }
    })
})

//delete admin
router.delete("/:adminId", (req, res) => {
    var adminId = req.params.adminId
    Admin.findByIdAndRemove(adminId, (err, data) => {
        if (err) {
            console.error(err)
            res.json({ err })
        } else {
            res.json({
                succ: {
                    message: "Admin succesfully deleted"
                }
            })
        }
    })
})








module.exports = router