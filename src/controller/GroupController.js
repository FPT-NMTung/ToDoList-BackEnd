const Groups = require('../model/Groups')
const UsersAndGroups = require('../model/UsersAndGroups')
const {validateNumber, validateStringNotEmpty} = require('../CommonMethod')
const Users = require('../model/Users')

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

    await new UsersAndGroups(idUsers, idGroups, true, 1).save()

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
    const [idGroups, idGroupsStatus] = validateNumber(req.params.idGroups)

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

    res.status(200).json({
      code: 8820010,
      data: dataResult,
    })
  }

  addMember = async (req, res, next) => {
    const idUsers = req.idUsers
    // body gom idGroups, idUsers va emailMember
    const [idGroups, idGroupsStatus] = validateNumber(req.body.idGroups)
    const [emailMember, emailMemberStatus] = validateStringNotEmpty(req.body.emailMember.trim())

    if (idGroupsStatus === false || emailMemberStatus === false) {
      res.status(422).json({
        code: 8840016,
      })
      return
    }

    if (req.email === emailMember) {
      res.status(422).json({
        code: 8840016,
      })
      return
    }

    // check quyen cua idUsers co phai la owner cua idGroups hay khong
    let isOwner = true
    await Groups.checkOwnerGroup(idGroups, idUsers)
      .then(([data]) => {
        isOwner = data.length !== 0
      })

    if (isOwner === false) {
      res.status(422).json({
        code: 8840016,
      })
      return
    }

    // check emailMember co ton tai hay khong
    let dataUser
    await Users.getUserByEmail(emailMember)
      .then(([data]) => {
        dataUser = data
      })

    if (dataUser.length === 0) {
      res.status(422).json({
        code: 8840016,
      })
      return
    }

    let isExist = false
    await UsersAndGroups.checkExistMember(idGroups, dataUser[0].idUsers)
      .then(([data]) => {
        isExist = data.length !== 0
      })

    if (isExist === true) {
      res.status(422).json({
        code: 8840016,
      })
      return
    }

    // add vao bang UsersAndGroups
    await new UsersAndGroups(dataUser[0].idUsers, idGroups, false, 1).save()

    res.status(200).json({
      code: 8820011,
    })
  }

  removeMember = async (req, res, next) => {
    const idUsers = req.idUsers

    const [idGroups, idGroupsStatus] = validateNumber(req.body.idGroups)
    const [idUsersMember, idUsersMemberStatus] = validateNumber(req.body.idUsersMember)

    if (idGroupsStatus === false || idUsersMemberStatus === false) {
      res.status(422).json({
        code: 8840017,
      })
      return
    }

    let isOwner = false
    await Groups.checkOwnerGroup(idGroups, idUsers)
      .then(([data]) => {
        isOwner = data.length !== 0
      })

    if (isOwner === false) {
      res.status(422).json({
        code: 8840017,
      })
      return
    }

    await UsersAndGroups.deleteMember(idGroups, idUsersMember)

    res.status(200).json({
      code: 8820012,
    })
  }
}

module.exports = new GroupController()