const express = require('express')
const router = express.Router()
const AuthRouter = require('../middleware/AuthRouter')
const TasksController = require('../controller/TasksController')

// [PUT]
router.put('/create', AuthRouter, TasksController.create)

// [GET]
router.get('/getAllTasks/:idGroups', AuthRouter, TasksController.getAllTasksForUser)

module.exports = router