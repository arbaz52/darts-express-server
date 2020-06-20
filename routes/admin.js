var router = require("express").Router()

var Admin = require("../db/Admin")
var Person = require("../db/Person")



//login
router.post("/login", function(req, res) {
    var user = req.body.user
    Admin.findOne({ email: user.email }, function(err, data) {
        if (err) {
            res.json({
                err: err
            })
        } else {
            if (!data) {
                res.json({
                    err: {
                        message: "Email not found!"
                    }
                })
                return
            }
            if (data.password == user.password) {
                req.session.admin = data
                Person.findById(user.personId, function(err, data) {
                    if (err) {
                        res.json({
                            err: err
                        })
                        return
                    } else {
                        req.session.person = data
                    }
                })
                res.json({
                    succ: {
                        message: "Login successful"
                    }
                })
            } else {
                res.json({
                    err: {
                        message: "Invalid password"
                    }
                })
            }
        }
    })
})

//logout
router.post("/logout", function(req, res) {
    req.session.destroy()
    res.json({
        succ: {
            message: "Logout successful"
        }
    })
})


var cameraRouter = require("./admin/camera")
var serverRouter = require("./admin/server")
var qrunitRotuer = require("./admin/qrunit")

function isAuthorized(req, res, next) {
    if (req.session.admin) {
        console.log("is an admin")
        next()
    } else {
        console.log("not an admin")
        res.json({
            err: {
                message: "You are not logged in"
            }
        })
    }

}

router.get("/isLoggedIn", isAuthorized, function(req, res) {
    res.json({
        succ: {
            message: "Admin is logged in"
        }
    })
})

//manage cameras
router.use("/cameras", isAuthorized, cameraRouter)
    //manage servers
router.use("/servers", isAuthorized, serverRouter)

router.use("/qrunit", isAuthorized, qrunitRotuer)


module.exports = router