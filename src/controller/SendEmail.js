const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')

const option = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  },
}

const SendMail = nodemailer.createTransport(sgTransport(option))
exports.SendMail = SendMail
