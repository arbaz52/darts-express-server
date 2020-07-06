var router = require("express").Router()

var QRAuth = require("./../db/QRAuth")
var QRUnit = require("./../db/QRUnit")
var Suspect = require("./../db/Suspect")
var Alert = require("./../db/Alert")
var Camera = require("./../db/Camera")

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

        alerts = await Alert.find({}).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera })

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

router.get("/:qrunitId/alerts/", async(req, res) => {
    try {
        var alerts = await Alert.find({}).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera })
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
        var alert = await Alert.findById(alertId).populate({ path: "suspectId", model: Suspect }).populate({ path: "cameraId", model: Camera })
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

module.exports = router