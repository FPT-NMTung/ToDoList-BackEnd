const express = require('express')
const router = express.Router()
const AuthRouter = require('../middleware/AuthRouter')
const GroupController = require('../controller/GroupController')

// [PUT]
router.put('/create', AuthRouter, GroupController.create)

// [GET]
router.get('/getInfo/:idGroups', AuthRouter, GroupController.checkBelongGroup)

// [GET]
router.get('/getAllGroups', AuthRouter, GroupController.getAllGroups)

// [GET]
router.delete('/delete', AuthRouter, GroupController.delete)

// [GET]
router.get('/getAllMember', AuthRouter, GroupController.getAllMember)

module.exports = router