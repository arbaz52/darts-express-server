var router = require("express").Router()

var Person = require("../db/Person")
var AuthoritativePerson = require("../db/AuthoritativePerson")

router.get("/", isAuthorized, (req, res) => {
    res.json({
        succ: {
            message: "Currently logged in authoritative"
        },
        authoritative: req._authoritative
    })
})

//login
router.post("/login", function(req, res) {
    var user = req.body.user
    AuthoritativePerson.findOne({ email: user.email }, function(err, data) {
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
                req.session.authoritative = data
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


async function isAuthorized(req, res, next) {
    if (req.session.authoritative) {
        console.log("is an authoritative")
        try {
            authoritative = await AuthoritativePerson.findById(req.session.authoritative._id, { password: 0 }).populate({ path: "personId", model: Person })
            req._authoritative = authoritative
            next()
        } catch (err) {
            res.json({ err, ce: "Catched error" })
        }
    } else {
        console.log("not an authoritative")
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
            message: "Authoritative personnel is logged in"
        }
    })
})

function checkPermission(lt, it) {
    var can = false
    lt.forEach(priv => {
        can = priv == it || priv == 'all' || can
    })
    return can
}


function canManageSuspects(req, res, next) {
    var ap = req._authoritative
    if (checkPermission(ap.privileges, 'manage suspects')) {
        next()
    } else {
        res.json({
            err: {
                message: "You are not permitted to access this functionality"
            }
        })
    }
}

function canAddAdmins(req, res, next) {
    var ap = req._authoritative
    if (checkPermission(ap.privileges, 'add admins')) {
        next()
    } else {
        res.json({
            err: {
                message: "You are not permitted to access this functionality"
            }
        })
    }
}


function canAddAuthoritative(req, res, next) {
    var ap = req._authoritative
    if (checkPermission(ap.privileges, 'add authoritative people')) {
        next()
    } else {
        res.json({
            err: {
                message: "You are not permitted to access this functionality"
            }
        })
    }
}

function canViewMap(req, res, next) {
    var ap = req._authoritative
    if (checkPermission(ap.privileges, 'view map')) {
        next()
    } else {
        res.json({
            err: {
                message: "You are not permitted to access this functionality"
            }
        })
    }
}

var suspectsRouter = require("./authoritative/suspect")
router.use("/suspects", isAuthorized, canManageSuspects, suspectsRouter)


var adminRouter = require("./authoritative/admin")
router.use("/admin", isAuthorized, canAddAdmins, adminRouter)

var authoritativeRouter = require("./authoritative/authoritative")
router.use("/authoritative", isAuthorized, canAddAuthoritative, authoritativeRouter)

var mapsRouter = require("./authoritative/map")
router.use("/map", isAuthorized, canViewMap, mapsRouter)

module.exports = router