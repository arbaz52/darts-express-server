var router = require("express").Router()

var QRAuth = require("./../db/QRAuth")
var QRUnit = require("./../db/QRUnit")
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

router.get("/:qrunitId", async(req, res) => {
    try {
        var qrunitId = req.params.qrunitId
        qrunit = await QRUnit.findById(qrunitId)
            //load information of all the qrunits
        qrunits = await QRUnit.find({}).populate("members")
        res.json({
            succ: {
                message: "All the registered QR Units"
            },
            qrunits
        })
    } catch (err) {
        console.error(err)
        res.json({ err })
    }

})

module.exports = router