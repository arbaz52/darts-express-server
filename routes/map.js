var express = require("express")
var router = express.Router()


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

module.exports = router