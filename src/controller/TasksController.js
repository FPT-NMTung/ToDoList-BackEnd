const Tasks = require('../model/Tasks')
const UsersAndGroups = require('../model/UsersAndGroups')
const {isNumber, validateNumber, validateStringNotEmpty, validateArray} = require('../CommonMethod')

class TasksController {
  create = async (req, res, next) => {
    const idUsers = req.idUsers

    let [name, statusName] = validateStringNotEmpty(req.body.name)
    let [severity, statusSevere] = validateNumber(req.body.severity)
    let [member, statusMember] = validateArray(req.body.member)
    let [idGroups, statusGroups] = validateNumber(req.body.idGroups)
    let dataResult

    if (statusName === false || statusSevere === false || statusMember === false || statusGroups === false) {
      res.status(422).json({
        code: 8840013,
      })
      return
    }

    await UsersAndGroups.getInfo(idUsers, idGroups)
      .then(([data]) => {
        dataResult = data
      })

    if (dataResult.length === 0) {
      // log error
      res.status(422).json({
        code: 8840013,
      })
      return
    }

    const newTask = new Tasks(idGroups, name, 0, severity, 0, 0, [idUsers, ...member], idUsers)
    await newTask.save()

    res.status(201).json({
      code: 8820008,
    })
  }

  getAllTasksForUser = async (req, res, next) => {
    const idUsers = req.idUsers

    let [idGroups, statusIdGroups] = validateNumber(req.params.idGroups)

    if (statusIdGroups === false) {
      res.status(422).json({
        code: 8840014,
      })
      return
    }

    let dataResult
    await Tasks.getAllTasksForUser(idGroups, idUsers)
      .then(([data]) => {
        dataResult = data
      })

    let dataUsers
    await UsersAndGroups.getAllMember(idGroups)
      .then(([data]) => {
        dataUsers = data
      })

    dataResult.map((task) => {
      const temp = task.members.map((member) => {
        const findMember = dataUsers.find((user) => {
          return user.idUsers === member
        })
        return findMember
      })
      task.members = temp
      return task
    })

    res.status(200).json({
      code: 8820009,
      data: dataResult,
    })
  }
}

module.exports = new TasksController()