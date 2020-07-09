var router = require("express").Router()

var QRAuth = require("./../db/QRAuth")
var QRUnit = require("./../db/QRUnit")
var Suspect = require("./../db/Suspect")
var Alert = require("./../db/Alert")
var Camera = require("./../db/Camera")
var Person = require("./../db/Person")

router.get("/authenticate/:authkey", (req, res) => {
        var key = req.params.authkey
        QRAuth.find({
            key: key
        }, (err, data) => {
            if (err) {
                console.error(err)
                res.json({ err })
            } else if (data.length == 0) {
                res.json({ err: { message: "This one time login key does not exist!" } })
            } else {
                console.log(data)
                var data = data[0]
                var id = data.QRUnitId
                QRAuth.findByIdAndRemove(data._id, (err) => {
                    if (err) {
                        res.json({ err })
                    } else {
                        res.json({
                            succ: {
                                message: "One-time login key used!"
                            },
                            qrunitId: id
                        })
                    }
                })
            }
        })
    })
    //get all the information required
router.get("/:qrunitId", async(req, res) => {
    try {
        var qrunitId = req.params.qrunitId
        qrunit = await QRUnit.findById(qrunitId)
            //load information of all the qrunits
        qrunits = await QRUnit.find({}).populate("members")

        suspects = await Suspect.find({})

        alerts = await Alert.find({}).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera }).populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })

        res.json({
            succ: {
                message: "Data required"
            },
            qrunits,
            alerts,
            suspects
        })
    } catch (err) {
        console.error(err)
        res.json({ err })
    }

})

router.get("/:qrunitId/qrunits/", async(req, res) => {
    try {
        qrunits = await QRUnit.find({}).populate("members")
        res.json({
            succ: {
                message: "All the QRUnits"
            },
            qrunits
        })
    } catch (err) {
        res.json({ err })
    }
})

router.get("/:qrunitId/qrunits/:id", async(req, res) => {
    try {
        var id = req.params.id;
        qrunit = await QRUnit.findById(id).populate("members")
        res.json({
            succ: {
                message: "QRUnit"
            },
            qrunit
        })
    } catch (err) {
        res.json({ err })
    }
})


router.get("/:qrunitId/alerts/", async(req, res) => {
    try {
        var alerts = await Alert.find({}).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera }).populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
        res.json({
            succ: {
                message: "Alerts"
            },
            alerts
        })
    } catch (err) {
        res.json({ err })
    }
})
router.get("/:qrunitId/alerts/:alertId", async(req, res) => {
    try {
        var alertId = req.params.alertId
        var alert = await Alert.findById(alertId).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera }).populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
        res.json({
            succ: {
                message: "Alert"
            },
            alert
        })

    } catch (err) {
        res.json({ err })
    }

})
router.get("/:qrunitId/suspects/", async(req, res) => {
    try {
        var suspects = await Suspect.find({})
        res.json({
            succ: {
                message: "Suspects"
            },
            suspects
        })
    } catch (err) {
        res.json({ err })
    }
})
router.get("/:qrunitId/suspects/:suspectId", async(req, res) => {
    try {
        var suspectId = req.params.suspectId
        var suspect = await Suspect.findById(suspectId)
        var alerts = await Alert.find({ suspectId }).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera })
        res.json({
            succ: {
                message: "Suspect"
            },
            suspect,
            alerts
        })

    } catch (err) {
        res.json({ err })
    }
})




//handling alert
router.put("/:qrunitId/alerts/:alertId/handle", async(req, res) => {
        try {
            var qrunitId = req.params.qrunitId
            var alertId = req.params.alertId
            var alert = await Alert.findById(alertId).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera }).populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
            if (alert.qrunit) {
                res.json({
                    err: {
                        message: "Alert is already being handled or closed!"
                    },
                    alert
                })
            } else {
                Alert.findByIdAndUpdate(alertId, {
                    qrunit: qrunitId,
                    started_handling: new Date()
                }, async(err, d) => {
                    if (err) {
                        res.json({ err })
                    } else {
                        var alert = await Alert.findById(alertId).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera }).populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
                        res.json({
                            succ: {
                                message: "You've now been assigned this alert!"
                            },
                            alert
                        })
                    }
                })
            }

        } catch (err) {
            res.json({ err })
        }
    })
    //closing alert
router.put("/:qrunitId/alerts/:alertId/close/:reason", async(req, res) => {
    try {
        var qrunitId = req.params.qrunitId
        var alertId = req.params.alertId
        var reason = req.params.reason
        var alert = await Alert.findById(alertId).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera }).populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
        if (alert.qrunit) {
            //check if you're handling the alert
            if (alert.qrunit._id.equals(qrunitId)) {
                //check if it's already been closed
                if (alert.closed_alert) {
                    res.json({
                        err: {
                            message: "Alert has been closed"
                        },
                        alert
                    })
                } else {

                    //close the alert
                    Alert.findByIdAndUpdate(alertId, {
                        qrunit: qrunitId,
                        closed_alert: new Date(),
                        reason
                    }, async(err, d) => {
                        if (err) {
                            res.json({ err })
                        } else {
                            var alert = await Alert.findById(alertId).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera }).populate({ path: "qrunit", model: QRUnit, populate: { path: "members", model: Person } })
                            res.json({
                                succ: {
                                    message: "You've closed this alert, reason: '" + reason + "'"
                                },
                                alert
                            })
                        }
                    })
                }
            } else {
                res.json({
                    err: {
                        message: "You're not the one handling the alert!"
                    },
                    alert
                })
            }
        } else {
            res.json({
                err: {
                    message: "Please handle the alert first!"
                },
                alert
            })
        }

    } catch (err) {
        res.json({ err })
    }
})



module.exports = router