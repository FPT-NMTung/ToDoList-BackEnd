const Users = require('../model/Users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {SendMail} = require('./SendEmail')
const md5 = require('md5')
const {cloudinary} = require('../util/cloudinary')

class UserController {
  create = async (req, res, next) => {

    //<editor-fold desc="Check data">
    let name = ''
    let email = ''
    let password = ''

    try {
      name = req.body.name.trim()
      email = req.body.email.trim()
      password = req.body.password.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    const check = !(name.length > 0) || !(email.includes('@')) || !(password.length >= 8)

    if (check) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }
    //</editor-fold>

    let isExistEmail = false
    await Users.getUserByEmail(email)
      .then(([data]) => {
        isExistEmail = data.length !== 0
      })

    if (isExistEmail) {
      res.status(422).json({
        code: 8840001,
      })
      return
    }

    const data = bcrypt.hashSync(password, 10)

    let tokenActive = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < 64; i++) {
      tokenActive += characters.charAt(Math.floor(Math.random() *
        charactersLength))
    }

    const newUser = new Users(name, email, data, tokenActive)
    await newUser.save()

    const url = `http://localhost:3000/active-account?token=${tokenActive}`

    const content = {
      to: [email],
      from: 'nmtung.temp@gmail.com',
      fromname: 'ToDoList | Project', // We set the `fromname` parameter here
      subject: 'Active account',
      text: 'Active account',
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title><style>body{display:flex;flex-direction:column;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif}.body{width:700px;background:rgb(237, 193, 211);background:linear-gradient(138deg, rgba(237, 193, 211, 1) 0%, rgba(145, 189, 236, 1) 100%);padding:60px}.main{background-color:white;padding:20px 40px;border-radius:20px}.infomation{text-align:center;font-size:12px}.infomation>p{margin:4px}.link{margin:30px 0}.link>a{text-decoration:none;color:white;padding:12px 16px;background-color:#a045e1;border-radius:4px;font-weight:bold}.title{text-align:center}.name>p{margin:4px;font-size:12px}</style></head><body><div class="body"><div class="main"><div class="title"><h2>Verify account</h3></div><hr><div class="content"><p>Hi <b>${name}</b>,</p><p>Thanks for signing up to To Do List, great to have you!</p><p>Please verify your email address by clicking the link below.</p></div><div class="link"> <a href="` + url + `">Verify account</a></div><div class="name"><p>Regards,</p><p>NMTung 💜</p></div><hr><div class="infomation"><p><i>Please feel free to contact us at nmtung.study@gmail.com.</i></p></div></div></div></body></html>`,
    }

    SendMail.sendMail(content, function (err, a) {
      if (!err) {
        res.status(201).json({
          code: 8820001,
        })
        return
      }

      res.status(500).json({
        code: 8840007,
      })
    })
  }

  login = async (req, res, next) => {
    let email = ''
    let password = ''

    try {
      email = req.body.email.trim()
      password = req.body.password.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let userArray
    await Users.getUserByEmail(email)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      res.status(422).json({
        code: 8840003,
      })
      return
    }

    const select = userArray[0]
    const isMatch = bcrypt.compareSync(password, select.password)

    if (!isMatch) {
      res.status(422).json({
        code: 8840003,
      })
      return
    }

    if (select.tokenActiveAccount) {
      res.status(422).json({
        code: 8840010,
      })
      return
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

    let oddPass
    let newPass

    try {
      oddPass = req.body.oddPassword.trim()
      newPass = req.body.newPassword.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    if (oddPass === newPass) {
      res.status(422).json({
        code: 8840004,
      })
      return
    }

    let userArray
    await Users.getUserById(idUsers)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      res.status(401).json({
        message: 'Not authenticated',
      })
      return
    }

    const user = userArray[0]
    const check = bcrypt.compareSync(oddPass, user.password)

    if (!check) {
      res.status(422).json({
        code: 8840005,
      })
      return
    }

    const hashPass = bcrypt.hashSync(newPass, 10)
    const newUser = new Users(user.name, user.email, hashPass)

    await newUser.update(user.idUsers)

    res.status(200).json({
      code: 8820002,
    })
    return
  }

  resetPassword = async (req, res, next) => {
    let email

    try {
      email = req.body.email
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let usersArray
    await Users.getUserByEmail(email)
      .then(([data]) => {
        usersArray = data
      })

    if (usersArray.length === 0) {
      res.status(422).json({
        code: 8840006,
      })
      return
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
    SendMail.sendMail(content, function (err, a) {
      if (err) {
        isErrorSendEmail = true
      }

      if (isErrorSendEmail) {
        res.status(500).json({
          code: 8840007,
        })
        return
      }

      res.status(200).json({
        code: 8820003,
      })
      return
    })
  }

  checkTokenResetPassword = async (req, res, next) => {
    let id
    let token

    try {
      id = req.body.id.trim()
      token = req.body.token.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let userArray
    await Users.getUserByTokenResetPass(id + token)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      res.status(422).json({
        code: 8840008,
      })
      return
    }

    const user = userArray[0]

    if (user.tokenResetPasswordExp >= new Date()) {
      res.status(200).json({
        code: 8820004,
      })
    } else {
      res.status(422).json({
        code: 8840009,
      })
    }
  }

  changePasswordByResetPassword = async (req, res, next) => {
    let token
    let pass

    try {
      token = req.body.token.trim()
      pass = req.body.password.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let userArray
    await Users.getUserByTokenResetPass(token)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      res.status(422).json({
        code: 8840008,
      })
      return
    }

    const user = userArray[0]

    const hashPass = bcrypt.hashSync(pass, 10)

    await Users.updatePasswordByTokenReset(hashPass, user.idUsers)

    res.status(200).json({
      code: 8820002,
    })
  }

  checkTokenActiveAccount = async (req, res, next) => {
    let token

    try {
      token = req.body.token.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let userArray
    await Users.getUserByTokenActiveAccount(token)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      res.status(422).json({
        code: 8840009,
      })
      return
    } else {
      res.status(200).json({
        code: 8820004,
      })
      return
    }
  }

  activeAccount = async (req, res, next) => {
    let token

    try {
      token = req.body.token.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let userArray = []
    await Users.getUserByTokenActiveAccount(token)
      .then(([data]) => {
        userArray = data
      })

    if (userArray.length === 0) {
      res.status(422).json({
        code: 8840009,
      })
      return
    }

    let user = userArray[0]
    await Users.activeAccount(user.idUsers)

    res.status(200).json({
      code: 8820005,
    })
  }

  getInformation = async (req, res, next) => {
    let id

    try {
      id = req.params.idUsers
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let arrayUser = []
    await Users.getUserById(id)
      .then(([data]) => {
        arrayUser = data
      })

    if (arrayUser.length === 0) {
      res.status(422).json({
        code: 8840008,
      })
      return
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

    let imageBase64

    try {
      imageBase64 = req.body.image.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
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