var express = require("express")
var router = express.Router()

var Camera = require("./../../db/Camera")
var Server = require("./../../db/Server")
var QRUnit = require("./../../db/QRUnit")
var Alert = require("./../../db/Alert")
var Suspect = require("./../../db/Suspect")

router.get("/", (req, res) => {
    res.json({
        succ: {
            message: "Working"
        }
    })
})
router.get("/cameras", (req, res) => {
    Camera.find({}, (err, data) => {
        if (err) {
            console.error(err)
            res.json({ err })
        } else {
            res.json({
                succ: {
                    message: "Cameras"
                },
                cameras: data
            })
        }
    })
})
router.get("/servers", (req, res) => {
    Server.find({}, (err, data) => {
        if (err) {
            console.error(err)
            res.json({ err })
        } else {
            res.json({
                succ: {
                    message: "Servers"
                },
                servers: data
            })
        }
    })

})
router.get("/alerts", (req, res) => {
    Alert.find({}).populate({
        path: "suspectId",
        model: Suspect
    }).populate({
        path: "cameraId",
        model: Camera
    }).exec((err, data) => {
        if (err) {
            console.error(err)
            res.json({ err })
        } else {
            res.json({
                succ: {
                    message: "Alerts"
                },
                alerts: data
            })
        }
    })

})

router.get("/alerts/:suspectId", (req, res) => {
    var suspectId = req.params.suspectId
    Alert.find({ suspectId: suspectId }).populate({
        path: "suspectId",
        model: Suspect
    }).populate({
        path: "cameraId",
        model: Camera
    }).exec((err, data) => {
        if (err) {
            console.error(err)
            res.json({ err })
        } else {
            res.json({
                succ: {
                    message: "Alerts for suspect"
                },
                alerts: data
            })
        }
    })

})



router.get("/qrunits", (req, res) => {
    QRUnit.find({}).populate("members").exec((err, data) => {
        if (err) {
            console.error(err)
            res.json({ err })
        } else {
            res.json({
                succ: {
                    message: "QRUnits"
                },
                qrunits: data
            })
        }
    })
})


const opencage = require('opencage-api-client');

router.get("/search/:query", (req, res) => {
    query = req.params.query
    opencage.geocode({ q: query })
        .then((r) => {
            console.log(r);
            res.json({
                succ: {
                    message: "Locations"
                },
                locations: r
            })
        })
        .catch((err) => {
            console.log(err);
            res.json({
                err
            })
        });
})

module.exports = router