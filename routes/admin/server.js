var router = require("express").Router()
var Camera = require("../../db/Camera")
var Server = require("../../db/Server")
AskServersToCheckAlive = require("../../talker/talker").AskServersToCheckAlive

//CRUD Operations

//Read
router.get("/", function(req, res) {
    Server.find({}, async function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            let servers = []

            for (let i = 0; i < data.length; i++) {
                let serverId = data[i]._id
                try {
                    let cameras = await Camera.find({
                        serverId
                    })
                    server = JSON.parse(JSON.stringify(data[i]))
                    server.cameras = cameras
                    servers.push(server)
                    console.log(server, data, servers)
                } catch (err) {
                    console.error(err)
                }

            }


            res.json({
                servers: servers
            })
        }
    })
})
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
                server = JSON.parse(JSON.stringify(data))
                server.cameras = cameras
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

//Create
router.post("", function(req, res) {
    var server = req.body.server
    Server.create(server, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            res.json({
                succ: {
                    message: "Server successfully added!"
                },
                server: data
            })
        }
    })
})

//Update
router.put("/:server_id", function(req, res) {

    var server = req.body.server
    var server_id = req.params.server_id

    cameras = null
    if (server.cameras) {
        cameras = server.cameras
        delete server.cameras
    }

    Server.findByIdAndUpdate(server_id, {
        $set: server
    }, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            if (cameras) {
                Camera.find({
                    serverId: server_id
                }, function(err, data) {
                    if (err) {
                        console.error(err)
                    } else if (data != null && data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                            shouldRemove = true
                            for (let j = 0; j < cameras.length; j++) {
                                if (cameras[j]._id == data[i]._id) {
                                    shouldRemove = false
                                    break
                                }
                            }
                            if (shouldRemove) {
                                data[i].serverId = undefined
                                data[i].save()
                                console.log("Disconnected camera: " + data[i]._id + " from server : " + server_id)
                            }
                        }
                    }
                })
            }


            res.json({
                succ: {
                    message: "Server successfully updated!"
                },
                server: data
            })
        }
    })
})

//Delete
router.delete("/:server_id", function(req, res) {
    //unassign server to cameras that were connected to this server
    var server_id = req.params.server_id


    Server.findByIdAndRemove(server_id, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {


            Camera.find({
                serverId: server_id
            }, function(err, data) {
                if (err) {
                    console.error(err)
                } else if (data != null && data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        data[i].serverId = undefined
                        data[i].save()
                        console.log("Disconnected camera: " + data[i]._id + " from server : " + server_id)
                    }
                }
            })
            AskServersToCheckAlive()
            res.json({
                succ: {
                    message: "Server successfully removed!"
                }
            })
        }
    })
})

module.exports = router