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




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "goodSecret",
    saveUninitialized: true,
    resave: true
}))


//use routers here
app.use(cors({
    credentials: true,
    origin: "http://localhost:4200"
}))
app.use("/server", serverRouter)

app.use("/admin", adminRouter)

app.use("/authoritative", authoritativeRouter)




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