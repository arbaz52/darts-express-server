var router = require("express").Router()

var Admin = require("../db/Admin")
var Person = require("../db/Person")

router.get("/", isAuthorized, (req, res) => {
    if (req._admin) {
        res.json({
            succ: {
                message: "Currently logged in admin"
            },
            admin: req._admin
        })
    } else {
        res.json({
            err: {
                message: "Admin information not available"
            }
        })
    }
})


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

async function isAuthorized(req, res, next) {
    if (req.session.admin) {
        console.log("is an admin")
        try {
            admin = await Admin.findById(req.session.admin._id, { password: 0 }).populate({ path: "personId", model: Person })
            req._admin = admin
            next()
        } catch (err) {
            res.json({ err, ce: "Catched error" })
        }
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

function canManageCameras(req, res, next) {
    var can = false
    var admin = req._admin
    admin.privileges.forEach(priv => {
        can = priv == 'manage cameras' || priv == 'all' || can
    })
    if (can) {
        next()
    } else {
        res.json({
            err: {
                message: "You are not permitted to access this functionality"
            }
        })
    }
}

function canManageServers(req, res, next) {
    var can = false
    var admin = req._admin
    admin.privileges.forEach(priv => {
        can = priv == 'manage servers' || priv == 'all' || can
    })
    if (can) {
        next()
    } else {
        res.json({
            err: {
                message: "You are not permitted to access this functionality"
            }
        })
    }
}

function canManageQRUnits(req, res, next) {

    var can = false
    var admin = req._admin
    admin.privileges.forEach(priv => {
        can = priv == 'manage qrunits' || priv == 'all' || can
    })
    if (can) {
        next()
    } else {
        res.json({
            err: {
                message: "You are not permitted to access this functionality"
            }
        })
    }
}

//manage cameras
router.use("/cameras", isAuthorized, canManageCameras, cameraRouter)
    //manage servers
router.use("/servers", isAuthorized, canManageServers, serverRouter)

router.use("/qrunit", isAuthorized, canManageQRUnits, qrunitRotuer)


module.exports = router