var nodemailer = require("nodemailer")
var config = require("./config.json")

var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.email,
        pass: config.password
    }
})

var emailTemplate = {
    from: config.email,
    to: "testemail@gmail.com",
    subject: "test subject",
    html: "<h1>Test Content<h1>"
}

module.exports.transport = transport
module.exports.emailTemplate = emailTemplate