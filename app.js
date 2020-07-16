var fs = require('fs');
var dirs = ['./public/images', './public/images/frames'];
console.log("Setting up folder structure")
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
})

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var session = require("express-session")


//require routers here
var serverRouter = require("./routes/server")

var adminRouter = require("./routes/admin")

var authoritativeRouter = require("./routes/authoritative")

var qrunitRouter = require("./routes/qrunitRouter")

var mapRouter = require("./routes/map")

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "100mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

bodyparser = require("body-parser")
app.use(bodyparser.json({ limit: "100mb" }))
app.use(bodyparser.urlencoded({ extended: false, limit: "100mb" }))

app.use(session({
    secret: "goodSecret",
    saveUninitialized: true,
    resave: true
}))


//use routers here
var allowedOrigins = ['http://localhost:4200',
    'https://arbaz52.github.io',
    "http://darts-fyp.herokuapp.com"
];
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        console.log(origin, allowedOrigins)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log(msg)
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            console.log(msg)
            return callback(new Error(msg), false);
        }
        console.log("allowing")
        return callback(null, true);
    },
    credentials: true,
    preflightContinue: true
}));
app.use("/server", serverRouter)

app.use("/admin", adminRouter)

app.use("/authoritative", authoritativeRouter)


app.use("/qrunit", qrunitRouter)

app.use("/map", mapRouter)

var Person = require("./db/Person")
app.get("/start", async(req, res) => {
    person = {
        fullName: "Arbaz Ajaz",
        gender: "male",
        picture_url: "x"
    }
    p = await Person.create(person)
    ap = {
        personId: p._id,
        email: "arbaz5256@gmail.com",
        password: "1234",
        privileges: ['all']
    }
    ap = await AuthoritativePerson.create(ap)
    res.json({ ap })
})


app.get("/setup/:setupAccountId", (req, res) => {
    res.render("setupAccount")
})

var AuthoritativePerson = require("./db/AuthoritativePerson")
var Admin = require("./db/Admin")
var SetupAccount = require("./db/SetupAccount")
app.post("/setup/:setupAccountId", (req, res) => {
    var setupAccountId = req.params.setupAccountId
    var passCode = req.body.passCode
    console.log(setupAccountId, passCode)
    SetupAccount.findById(setupAccountId, async(err, data) => {
        if (err) {
            res.send("An error occured: " + err.message)
        } else {
            //account found
            console.log(data)
            if (data != null) {
                if (data.passCode == passCode) {

                    //set this password
                    var pwd = req.body.password
                    try {
                        if (data.accountType == 'admin') {
                            await Admin.findByIdAndUpdate(data.accountId, {
                                password: pwd
                            })
                        } else if (data.accountType == 'authoritative') {
                            await AuthoritativePerson.findByIdAndUpdate(data.accountId, {
                                password: pwd
                            })
                        } else {
                            console.error("Account type invalid!")
                            res.send("Account type invalid!")
                            return
                        }
                        //remove the setupaccount entry
                        await SetupAccount.findByIdAndRemove(data._id)
                        res.send("Password successfully updated!")
                    } catch (ex) {
                        console.error(ex)
                        res.json({ err: ex })
                    }
                } else {
                    res.json({
                        err: {
                            message: "Invalid verification code (passcode)"
                        }
                    })

                }
            } else {
                res.send("This functionality doesn't exist!")
            }
        }
    })
})



//imports and everything for this should be here
//testing out features without the need to complete extra steps
app.use("/test/", (req, res) => {
    res.send("Testing path")
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ err })
});

module.exports = app;