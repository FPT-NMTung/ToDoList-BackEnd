const express = require('express')
const router = express.Router()
const AuthRouter = require('../middleware/AuthRouter')

const UserController = require('../controller/UserController')

// [GET]
router.get('/information/:idUsers', AuthRouter, UserController.getInformation)

// [PUT]
router.put('/create', UserController.create)

// [POST]
router.post('/login', UserController.login)

// [PUT]
router.put('/change-password', AuthRouter, UserController.changePassword)

// [POST]
router.post('/reset-password', UserController.resetPassword)

// [POST]
router.post('/reset-password/check-token', UserController.checkTokenResetPassword)

// [PUT]
router.put('/reset-password/submit', UserController.changePasswordByResetPassword)

// [POST]
router.post('/active-account/check-token', UserController.checkTokenActiveAccount)

// [PUT]
router.put('/active-account', UserController.activeAccount)

// [PUT]
router.put('/change-avatar', AuthRouter, UserController.changeAvatar)

module.exports = router