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



//assign server to cameras



module.exports = router