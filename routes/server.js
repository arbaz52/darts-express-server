var router = require("express").Router()
var Server = require("../db/Server")
var Camera = require("../db/Camera")
var Suspect = require("../db/Suspect")
var Preproccessing = require("../db/Preprocessing")

//sends the cameras assigned to this server
router.get("/:server_id", function(req, res) {

    var server_id = req.params.server_id
    Server.findById(server_id, async function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else if (!data) {
            res.json({
                err: {
                    message: "Server not found!"
                }
            })
        } else {

            let server = {}
            let serverId = data._id
            try {
                let cameras = await Camera.find({
                    serverId
                })
                camerasIds = []
                cameras.forEach(camera => {
                    camerasIds.push(camera._id)
                })
                pps = await Preproccessing.find({
                    cameraId: {
                        $in: camerasIds
                    }
                })
                preprocessings = {}
                pps.forEach(pp => {
                    preprocessings[pp.cameraId] = pp
                })
                server = JSON.parse(JSON.stringify(data))
                server.cameras = cameras
                server.preprocessings = preprocessings

                let suspects = await Suspect.find({})
                server.suspects = suspects
                    //get all the suspects and provide the details as well

                res.json({
                    server: server
                })
            } catch (err) {
                console.error(err)
                res.json({
                    err: {
                        message: "Server not found!"
                    }
                })
            }

        }
    })
})


var multer = require("multer")

var path = require('path')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/frames/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({ storage: storage })


db = require("./../fb/fb").db
bucket = require("./../fb/fb").bucket

Alert = require("./../db/Alert")
Suspect = require("./../db/Suspect")

function getR() {
    return parseInt(Math.random() * 360)
}
var geolib = require("geolib")
router.post("/:serverId/alert/", upload.single("frame"), async(req, res) => {
    try {
        cameraId = req.body.cameraId
        suspectId = req.body.suspectId
        serverId = req.params.serverId

        //generate alert for firebase
        camera = await Camera.findById(cameraId)
        if (camera == null) {
            res.json({
                err: {
                    message: "Camera does not exist in the database!"
                }
            })
            return
        }
        pos = geolib.computeDestinationPoint({ latitude: camera.latitude, longitude: camera.longitude },
            20,
            getR()
        );
        console.log(pos)
            /*
            pos = {
                latitude: parseFloat(camera.latitude) + getR(),
                longitude: parseFloat(camera.longitude) + getR()
            }
            */
        frame = req.file.path
        blob = bucket.upload(frame, {}, (ur) => {
            console.log(ur)
        })

        frame_url = "https://storage.googleapis.com/fypqrf-b3259.appspot.com/" + req.file.filename
        time = new Date()
        alert = {
            suspectId,
            cameraId,
            latitude: pos.latitude,
            longitude: pos.longitude,
            frame_url,
            time
        }

        Alert.create(alert, async(err, d) => {
            if (err) {
                console.error(err)
                res.json({ err })
            } else {

                suspect = await Suspect.findById(suspectId, {
                    _id: 0,
                    __v: 0,
                })
                suspect = JSON.parse(JSON.stringify(suspect))
                fb_alert = {
                    location: pos,
                    frame_url,
                    suspect,
                    time: time + "",
                    suspectId,
                    alertId: d._id + ""
                }
                console.log(fb_alert)
                ref = db.ref("Alerts")

                ref.push().set(fb_alert)
                res.json({
                    succ: {
                        message: "Alert successfully generated!"
                    }
                })
            }
        })

    } catch (err) {
        console.error(err)
        res.json({ err })
    }
})

module.exports = router