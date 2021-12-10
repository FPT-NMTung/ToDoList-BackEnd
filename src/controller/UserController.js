const Users = require('../model/Users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {SendMail} = require('./SendEmail')
const md5 = require('md5')
const {cloudinary} = require('../util/cloudinary')
const {validateStringNotEmpty} = require('../CommonMethod')

class UserController {
  create = async (req, res, next) => {

    let [name, nameStatus] = validateStringNotEmpty(req.body.name)
    let [email, emailStatus] = validateStringNotEmpty(req.body.email)
    let [password, passwordStatus] = validateStringNotEmpty(req.body.password)

    if (!nameStatus || !emailStatus || !passwordStatus) {
      return res.status(422).json({
        code: 8840001,
        message: 'Name, email or password does not exist or is not valid',
      })
    }

    if (!(name.length > 0) || !(email.includes('@')) || !(password.length >= 8)) {
      return res.status(422).json({
        code: 8840002,
        message: 'Name, email or password does not format',
      })
    }

    let isExistEmail = false
    await Users.getUserByEmail(email)
      .then(([data]) => {
        isExistEmail = data.length !== 0
      })

    if (isExistEmail) {
      return res.status(422).json({
        code: 8840003,
        message: 'Email is already exist',
      })
    }

    const data = bcrypt.hashSync(password, 10)

    let tokenActive = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < 64; i++) {
      tokenActive += characters.charAt(Math.floor(Math.random() *
        charactersLength))
    }

    const url = `http://localhost:3000/active-account?token=${tokenActive}`
    const content = {
      to: [email],
      from: 'nmtung.temp@gmail.com',
      fromname: 'ToDoList | Project', // We set the `fromname` parameter here
      subject: 'Active account',
      text: 'Active account',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title><style>body{display:flex;flex-direction:column;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif}.body{width:700px;background:rgb(237, 193, 211);background:linear-gradient(138deg, rgba(237, 193, 211, 1) 0%, rgba(145, 189, 236, 1) 100%);padding:60px}.main{background-color:white;padding:20px 40px;border-radius:20px}.infomation{text-align:center;font-size:12px}.infomation>p{margin:4px}.link{margin:30px 0}.link>a{text-decoration:none;color:white;padding:12px 16px;background-color:#a045e1;border-radius:4px;font-weight:bold}.title{text-align:center}.name>p{margin:4px;font-size:12px}</style></head><body><div class="body"><div class="main"><div class="title"><h2>Verify account</h3></div><hr><div class="content"><p>Hi <b>${name}</b>,</p><p>Thanks for signing up to To Do List, great to have you!</p><p>Please verify your email address by clicking the link below.</p></div><div class="link"> <a href="` + url + `">Verify account</a></div><div class="name"><p>Regards,</p><p>NMTung 💜</p></div><hr><div class="infomation"><p><i>Please feel free to contact us at nmtung.study@gmail.com.</i></p></div></div></div></body></html>`,
    }

    let isSendErr
    await SendMail.sendMail(content, function (err, a) {
      isSendErr = err
    })

    if (isSendErr) {
      return res.status(422).json({
        code: 8840004,
        message: 'Send mail active fail',
      })
    }

    const newUser = new Users(name, email, data, tokenActive)
    await newUser.save()

    return res.status(200).json({
      message: 'Create user successfully',
    })
  }

  login = async (req, res, next) => {
    let [email, emailStatus] = validateStringNotEmpty(req.body.email)
    let [password, passwordStatus] = validateStringNotEmpty(req.body.password)

    if (!emailStatus || !passwordStatus) {
      return res.status(422).json({
        code: 8840005,
        message: 'Email or password does not exist or is not valid',
      })
    }

    let userArray
    await Users.getUserByEmail(email)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      return res.status(422).json({
        code: 8840006,
        message: 'Email or password is incorrect',
      })
    }

    const select = userArray[0]
    const isMatch = bcrypt.compareSync(password, select.password)

    if (!isMatch) {
      return res.status(422).json({
        code: 8840006,
        message: 'Email or password is incorrect',
      })
    }

    if (select.tokenActiveAccount) {
      return res.status(422).json({
        code: 8840007,
        message: 'Account is not active',
      })
    }

    const token = jwt.sign({
      idUsers: select.idUsers,
      name: select.name,
      email: select.email,
    }, 'co-khong-giu-mat-dung-tim')

    res.status(200).json({
      token: token,
      idUsers: select.idUsers,
      name: select.name,
      email: select.email,
    })
  }

  changePassword = async (req, res, next) => {
    const idUsers = req.idUsers

    let [oldPassword, oldPasswordStatus] = validateStringNotEmpty(req.body.oldPassword)
    let [newPassword, newPasswordStatus] = validateStringNotEmpty(req.body.newPassword)

    if (!oldPasswordStatus || !newPasswordStatus) {
      return res.status(422).json({
        code: 8840008,
        message: 'Old password or new password does not exist or is not valid',
      })
    }

    if (oldPassword === newPassword) {
      return res.status(422).json({
        code: 8840009,
        message: 'Old password and new password are the same',
      })
    }

    let userArray
    await Users.getUserById(idUsers)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      return res.status(422).json({
        code: 8840010,
        message: 'User does not exist',
      })
    }

    const user = userArray[0]
    const check = bcrypt.compareSync(oldPassword, user.password)

    if (!check) {
      return res.status(422).json({
        code: 8840011,
        message: 'Old password is incorrect',
      })
    }

    const hashPass = bcrypt.hashSync(newPassword, 10)
    const newUser = new Users(user.name, user.email, hashPass)

    await newUser.update(user.idUsers)

    return res.status(200).json({
      message: 'Change password successfully',
    })
  }

  resetPassword = async (req, res, next) => {
    let [email, emailStatus] = validateStringNotEmpty(req.body.email)

    if (!emailStatus) {
      return res.status(422).json({
        code: 8840012,
        message: 'Email does not exist or is not valid',
      })
    }

    let usersArray
    await Users.getUserByEmail(email)
      .then(([data]) => {
        usersArray = data
      })

    if (usersArray.length === 0) {
      return res.status(422).json({
        code: 8840013,
        message: 'User does not exist',
      })
    }

    const user = usersArray[0]
    const idUsersMd5 = md5(user.idUsers)

    console.log(idUsersMd5)

    let token = idUsersMd5
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < 32; i++) {
      token += characters.charAt(Math.floor(Math.random() *
        charactersLength))
    }

    let time = new Date()
    time.setDate(time.getDate() + 1)

    await Users.updateTokenResetPassword(token, time, user.idUsers)

    const url = `http://localhost:3000/reset-password/reset?token=${token}`

    const content = {
      to: [email],
      from: 'nmtung.temp@gmail.com',
      fromname: 'ToDoList | Project', // We set the `fromname` parameter here
      subject: 'Reset password',
      text: 'Reset password',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title><style>body{display:flex;flex-direction:column;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif}.body{width:700px;background:rgb(237, 193, 211);background:linear-gradient(138deg, rgba(237, 193, 211, 1) 0%, rgba(145, 189, 236, 1) 100%);padding:60px}.main{background-color:white;padding:20px 40px;border-radius:20px}.infomation{text-align:center;font-size:12px}.infomation>p{margin:4px}.link{margin:30px 0}.link>a{text-decoration:none;color:white;padding:12px 16px;background-color:#a045e1;border-radius:4px;font-weight:bold}.title{text-align:center}.name>p{margin:4px;font-size:12px}</style></head><body><div class="body"><div class="main"><div class="title"><h2>Reset password</h3></div><hr><div class="content"><p>Hi <b>${user.name}</b>,</p><p>We have sent you this email in response to your request to reset your password on company name.</p><p>To reset your password, please follow the link below:</p></div><div class="link"> <a href="` + url + `">Reset password</a></div><div class="name"><p>Regards,</p><p>NMTung 💜</p></div><hr><div class="infomation"><p><i>Please ignore this email if you did not request a password change.</i></p><p><i>This link will expire in the next 24 hours.</i></p><p><i>Please feel free to contact us at nmtung.study@gmail.com.</i></p></div></div></div></body></html>`,
    }

    let isErrorSendEmail = false
    await SendMail.sendMail(content, function (err, a) {
      if (err) {
        isErrorSendEmail = true
      }
    })

    if (isErrorSendEmail) {
      return res.status(500).json({
        code: 8840014,
        message: 'Error send email reset password',
      })
    }

    return res.status(200).json({
      message: 'Send email reset password successfully',
    })
  }

  checkTokenResetPassword = async (req, res, next) => {
    let [id, idStatus] = validateStringNotEmpty(req.body.id)
    let [token, tokenStatus] = validateStringNotEmpty(req.body.token)

    if (!idStatus || !tokenStatus) {
      return res.status(422).json({
        code: 8840015,
        message: 'Token does not exist or is not valid',
      })
    }

    let userArray
    await Users.getUserByTokenResetPass(id + token)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      return res.status(422).json({
        code: 8840016,
        message: 'User does not exist',
      })
    }

    const user = userArray[0]

    if (user.tokenResetPasswordExp >= new Date()) {
      res.status(200).json({
        message: 'Token reset password is valid',
      })
    } else {
      res.status(422).json({
        code: 8840017,
        message: 'Token reset password is expired',
      })
    }
  }

  changePasswordByResetPassword = async (req, res, next) => {
    let [token, tokenStatus] = validateStringNotEmpty(req.body.token)
    let [password, passwordStatus] = validateStringNotEmpty(req.body.password)

    if (!tokenStatus || !passwordStatus) {
      return res.status(422).json({
        code: 8840018,
        message: 'Token and password does not exist or is not valid',
      })
    }

    let userArray
    await Users.getUserByTokenResetPass(token)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      return res.status(422).json({
        code: 8840019,
        message: 'User does not exist',
      })
    }

    const user = userArray[0]
    const hashPass = bcrypt.hashSync(password, 10)

    await Users.updatePasswordByTokenReset(hashPass, user.idUsers)

    res.status(200).json({
      message: 'Change password successfully',
    })
  }

  checkTokenActiveAccount = async (req, res, next) => {
    let [token, tokenStatus] = validateStringNotEmpty(req.body.token)

    if (!tokenStatus) {
      return res.status(422).json({
        code: 8840020,
        message: 'Token does not exist or is not valid',
      })
    }

    let userArray
    await Users.getUserByTokenActiveAccount(token)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      return res.status(422).json({
        code: 8840021,
        message: 'User does not exist',
      })
    } else {
      return res.status(200).json({
        message: 'Token active account is valid',
      })
    }
  }

  activeAccount = async (req, res, next) => {
    let [token, tokenStatus] = validateStringNotEmpty(req.body.token)

    if (!tokenStatus) {
      return res.status(422).json({
        code: 8840022,
        message: 'Token does not exist or is not valid',
      })
    }

    let userArray = []
    await Users.getUserByTokenActiveAccount(token)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      return res.status(422).json({
        code: 8840023,
        message: 'User does not exist',
      })
    }

    let user = userArray[0]
    await Users.activeAccount(user.idUsers)

    return res.status(200).json({
      message: 'Active account successfully',
    })
  }

  getInformation = async (req, res, next) => {
    let [id, idStatus] = validateStringNotEmpty(req.params.idUsers)

    if (!idStatus) {
      return res.status(422).json({
        code: 8840024,
        message: 'idUsers does not exist or is not valid',
      })
    }

    let arrayUser = []
    await Users.getUserById(id)
      .then(([data]) => {
        arrayUser = data
      })

    if (arrayUser.length === 0) {
      return res.status(422).json({
        code: 8840025,
        message: 'User does not exist',
      })
    }

    const {idUsers, name, email, avatar} = arrayUser[0]

    res.status(200).json({
      idUsers: idUsers,
      name: name,
      email: email,
      avatar: avatar,
    })
  }

  changeAvatar = async (req, res, next) => {
    const idUsers = req.idUsers

    let [imageBase64, imageBase64Status] = validateStringNotEmpty(req.body.image)

    if (!imageBase64Status) {
      return res.status(422).json({
        code: 8840026,
        message: 'Image does not exist or is not valid',
      })
    }

    let url
    await cloudinary.uploader.upload(imageBase64, undefined, (data, temp) => {
      url = temp.secure_url
    })

    await Users.changeAvatar(url, idUsers)

    res.status(200).json({
      image: url,
    })
  }
}

module.exports = new UserController()