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

// [DELETE]
router.delete('/delete', AuthRouter, GroupController.delete)

// [GET]
router.get('/getAllMember/:idGroups', AuthRouter, GroupController.getAllMember)

// [PUT]
router.put('/addMember', AuthRouter, GroupController.addMember)

// [DELETE]
router.delete('/removeMember', AuthRouter, GroupController.removeMember)

// [GET]
router.get('/check-owner-groups/:idGroups', AuthRouter, GroupController.checkOwnerGroups)

module.exports = router