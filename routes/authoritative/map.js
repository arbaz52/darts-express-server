var express = require("express")
var router = express.Router()

var Camera = require("./../../db/Camera")
var Server = require("./../../db/Server")
var QRUnit = require("./../../db/QRUnit")
var Alert = require("./../../db/Alert")
var Suspect = require("./../../db/Suspect")
var Person = require("./../../db/Person")

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
        })
        .populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
        .exec((err, data) => {
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
        })
        .populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
        .exec((err, data) => {
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


router.get("/alert/:alertId", (req, res) => {
    var alertId = req.params.alertId
    Alert.findById(alertId).populate({
            path: "suspectId",
            model: Suspect
        }).populate({
            path: "cameraId",
            model: Camera
        })
        .populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
        .exec((err, data) => {
            if (err) {
                console.error(err)
                res.json({ err })
            } else {
                res.json({
                    succ: {
                        message: "Alert"
                    },
                    alert: data
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



router.get("/camera/:camera_id", function(req, res) {
    var camera_id = req.params.camera_id
    Camera.findById(camera_id, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else if (!data) {
            res.json({
                err: {
                    message: "Camera not found!"
                }
            })
        } else {
            if (data.serverId) {
                Server.findById(data.serverId, function(e, d) {
                    if (e) {
                        res.json({
                            err: e
                        })
                    } else if (d == null) {
                        res.json({
                            err: {
                                message: "Server for this camera not found!"
                            }
                        })
                    } else {
                        data.server = d
                        console.log("working", data, d)
                        res.json({
                            camera: data,
                            server: d
                        })
                    }
                })
            } else {
                res.json({
                    camera: data
                })
            }
        }
    })
})

module.exports = router