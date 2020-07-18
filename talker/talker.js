var Server = require("./../db/Server")
var axios = require("axios")

let AskServersToUpdatePreprocessingValues = async() => {
    console.log("Asking python-servers to update preprocessing values")
    var servers = await Server.find({})
    servers.forEach(server => {
        var url = server.url + "/updatep"
        axios.get(url).then(data => {
            console.log(data)
        }).catch(err => {
            console.error(err)
        })
    })
}

let AskServersToUpdateCameras = async() => {
    console.log("Asking python-servers to update cameras")
    var servers = await Server.find({})
    servers.forEach(server => {
        var url = server.url + "/updatec"
        axios.get(url).then(data => {
            console.log(data)
        }).catch(err => {
            console.error(err)
        })
    })
}

let AskServersToUpdateSuspects = async() => {
    console.log("Asking python-servers to update Suspects")
    var servers = await Server.find({})
    servers.forEach(server => {
        var url = server.url + "/updates"
        axios.get(url).then(data => {
            console.log(data)
        }).catch(err => {
            console.error(err)
        })
    })
}

module.exports.AskServersToUpdatePreprocessingValues = AskServersToUpdatePreprocessingValues
module.exports.AskServersToUpdateCameras = AskServersToUpdateCameras
module.exports.AskServersToUpdateSuspects = AskServersToUpdateSuspects