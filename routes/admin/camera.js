var router = require("express").Router()

var Camera = require("../../db/Camera")
var Server = require("../../db/Server")

//CRUD Operations

//Read
router.get("/", function(req, res) {
    Camera.find({}, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            res.json({
                cameras: data
            })
        }
    })
})


var nodeGeocoder = require("node-geocoder")
const options = {
    provider: 'openstreetmap'
};
const geocoder = nodeGeocoder(options)
    //searching address to geo location
router.get("/search/:query", async(req, res) => {
    var query = req.params.query
    const d = await geocoder.geocode(query);
    if (d.length > 0) {
        console.log(d)
        res.json({
            succ: {
                message: "Location found"
            },
            location: d
        })
    } else {
        res.json({
            err: {
                message: "No location found!"
            }
        })
    }
})





router.get("/:camera_id", function(req, res) {
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

//Create
router.post("/", function(req, res) {
    var camera = req.body.camera
    Camera.create(camera, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            res.json({
                succ: {
                    message: "Camera successfully added!"
                },
                camera: data
            })
        }
    })
})

//Update
router.put("/:camera_id", function(req, res) {
    var camera = req.body.camera
    var camera_id = req.params.camera_id
    if ((camera.serverId &&
            camera.serverId == "") ||
        !(camera.serverId)) {
        delete camera.serverId
    }
    Camera.findByIdAndUpdate(camera_id, {
        $set: camera
    }, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            if ((camera.serverId &&
                    camera.serverId == "") ||
                !(camera.serverId)) {
                data.serverId = undefined
                data.save()
            }
            res.json({
                succ: {
                    message: "Camera successfully updated!"
                },
                camera: data
            })
        }
    })
})

//Delete
router.delete("/:camera_id", function(req, res) {
    var camera_id = req.params.camera_id
    Camera.findByIdAndRemove(camera_id, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            res.json({
                succ: {
                    message: "Camera successfully removed!"
                }
            })
        }
    })
})





var geolib = require("geolib")

//algo
/*
-get all the cameras
-get all the servers
- calculate the avg cameras a server should have
pick a camera
locate all nearest servers
one by one, check which one is free and assign the camera to it
if no server has the capacity, pick the closest one.
*/


//assign server to cameras
router.post("/autoassign", async(req, res) => {
    var cameras = await Camera.find({})
    var servers = await Server.find({})

    //holds (serverID, # of cameras) object.
    var assignmentTrack = []
    for (var i = 0; i < servers.length; i++) {
        assignmentTrack[servers[i]._id] = 0
    }
    console.log(assignmentTrack);

    var thresh = cameras.length / servers.length
    for (var i = 0; i < cameras.length; i++) {
        var camera = cameras[i];
        //calculate distance and sort based on distance
        var serversWithDistance = []
        for (var j = 0; j < servers.length; j++) {
            var server = servers[j];
            var dist = geolib.getDistance({
                latitude: camera.latitude,
                longitude: camera.longitude
            }, {
                latitude: server.latitude,
                longitude: server.longitude
            })
            serversWithDistance.push([server, dist])
        }
        //sorting
        for (var ii = 0; ii < serversWithDistance.length; ii++) {
            for (var j = ii + 1; j < serversWithDistance.length; j++) {
                if (serversWithDistance[ii][1] > serversWithDistance[j][1]) {
                    temp = serversWithDistance[ii];
                    serversWithDistance[ii] = serversWithDistance[j]
                    serversWithDistance[j] = temp
                }
            }
        }

        console.log("Thresh: " + thresh + "\nTotal Cameras: " + cameras.length + "\nTotal Servers: " + servers.length)
            //assassination
        var assigned = false
        for (var ii = 0; ii < serversWithDistance.length; ii++) {
            var server = serversWithDistance[ii][0]
                //find how cameras are connected to this server.
            var track = assignmentTrack[server._id]
            if (track < thresh) {
                assigned = true
                assignmentTrack[server._id] = track + 1
                    //assign
                var result = await Camera.findByIdAndUpdate(camera, {
                    serverId: server._id
                })
                break
            }

        }
        if (!assigned) {
            assigned = true
            var server = serversWithDistance[0][0]
            assignmentTrack[server._id] = track + 1
                //assign
            var result = await Camera.findByIdAndUpdate(camera, {
                serverId: server._id
            })
            console.log("No free slots available for this camera '" + camera._id + "', assigned nearest server '" + server._id + "'")

        }


    }

    res.json({
        cameras: cameras,
        servers: servers,
        succ: {
            message: "Check the details"
        },
        serversWithDistance
    })
})


module.exports = router