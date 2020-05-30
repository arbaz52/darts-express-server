var router = require("express").Router()
var Server = require("../db/Server")
var Camera = require("../db/Camera")
var Suspect = require("../db/Suspect")

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
                server = JSON.parse(JSON.stringify(data))
                server.cameras = cameras

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

module.exports = router