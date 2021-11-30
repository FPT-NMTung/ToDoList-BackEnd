const Groups = require('../model/Groups')
const UsersAndGroups = require('../model/UsersAndGroups')
const {validateNumber} = require('../CommonMethod')

class GroupController {
  create = async (req, res, next) => {
    const idUsers = req.idUsers

    let name

    try {
      name = req.body.name.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let idGroups
    const newGroup = new Groups(name)
    await newGroup.save()
      .then(([data]) => {
        idGroups = data.insertId
      })

    await new UsersAndGroups(idUsers, idGroups, true).save()

    res.status(201).json({
      code: 8820006,
      idGroups: idGroups,
    })
  }

  checkBelongGroup = async (req, res, next) => {
    const idUsers = req.idUsers

    let idGroups
    try {
      idGroups = req.params.idGroups.trim()
    } catch (e) {
      res.status(422).json({
        code: 8840002,
      })
      return
    }

    let arrayResult = []
    await UsersAndGroups.getInfo(idUsers, idGroups)
      .then(([data]) => {
        arrayResult = data
      })

    if (arrayResult.length === 0) {
      res.status(422).json({
        code: 8840011,
      })
      return
    }

    res.status(200).json({})
  }

  getAllGroups = async (req, res, next) => {
    const idUsers = req.idUsers

    let result = []
    await Groups.getALlGroup(idUsers)
      .then(([data]) => {
        result = data
      })

    res.status(200).json({
      arrayResult: result,
    })
  }

  delete = async (req, res, next) => {
    const idUsers = req.idUsers
    let idGroups

    try {
      idGroups = Number.parseInt(req.body.idGroups.trim())
    } catch (e) {
      res.status(422).json({
        code: 8840012,
      })
      return
    }
    let resultData

    await Groups.checkOwnerGroup(idGroups, idUsers)
      .then(([data]) => {
        resultData = data
      })

    if (resultData.length === 0) {
      res.status(422).json({
        code: 8840012,
      })
      return
    }

    await Groups.deleteGroup(idGroups)

    res.status(200).json({
      code: 8820007,
    })
  }

  getAllMember = async (req, res, next) => {
    const [idGroups, idGroupsStatus] = validateNumber(req.body.idGroups)

    if (idGroupsStatus === false) {
      res.status(422).json({
        code: 8840015,
      })
      return
    }

    let dataResult
    await UsersAndGroups.getAllMember(idGroups)
      .then(([data]) => {
        dataResult = data
      })


  }
}

module.exports = new GroupController()