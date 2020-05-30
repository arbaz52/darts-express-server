var router = require("express").Router()

var Person = require("../db/Person")
var AuthoritativePerson = require("../db/AuthoritativePerson")


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


function isAuthorized(req, res, next) {
    if (req.session.authoritative) {
        console.log("is an authoritative personnel")
        next()
    } else {
        console.log("not an authoritative personnel")
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


var suspectsRouter = require("./authoritative/suspect")
router.use("/suspects", isAuthorized, suspectsRouter)





module.exports = router