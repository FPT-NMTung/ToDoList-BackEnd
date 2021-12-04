const Groups = require('../model/Groups')
const UsersAndGroups = require('../model/UsersAndGroups')
const {validateNumber, validateStringNotEmpty} = require('../CommonMethod')
const Users = require('../model/Users')

class GroupController {
  create = async (req, res, next) => {
    const idUsers = req.idUsers

    let [name, nameStatus] = validateStringNotEmpty(req.body.name)

    if (!nameStatus) {
      return res.status(422).json({
        code: 8840027,
        message: 'Name does not exist or is not valid'
      })
    }

    let idGroups
    const newGroup = new Groups(name)
    await newGroup.save()
      .then(([data]) => {
        idGroups = data.insertId
      })

    await new UsersAndGroups(idUsers, idGroups, true, 1).save()

    res.status(200).json({
      message: 'Create group successfully'
    })
  }

  checkBelongGroup = async (req, res, next) => {
    const idUsers = req.idUsers

    let [idGroups, idGroupsStatus] = validateNumber(req.params.idGroups)

    if (!idGroupsStatus) {
      return res.status(422).json({
        code: 8840028,
        message: 'Id groups does not exist or is not valid'
      })
    }

    let arrayResult = []
    await UsersAndGroups.getInfo(idUsers, idGroups)
      .then(([data]) => {
        arrayResult = data
      })

    if (arrayResult.length === 0) {
      return res.status(422).json({
        code: 8840029,
        message: 'User does not belong to the group'
      })
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
    let [idGroups, idGroupsStatus] = validateNumber(req.body.idGroups)

    if (!idGroupsStatus) {
      return res.status(422).json({
        code: 8840030,
        message: 'Id groups does not exist or is not valid'
      })
    }

    let resultData
    await Groups.checkOwnerGroup(idGroups, idUsers)
      .then(([data]) => {
        resultData = data
      })

    if (resultData.length === 0) {
      return res.status(422).json({
        code: 8840031,
        message: 'User does not own the group'
      })
    }

    await Groups.deleteGroup(idGroups)

    res.status(200).json({
      code: 8820007,
    })
  }

  getAllMember = async (req, res, next) => {
    const [idGroups, idGroupsStatus] = validateNumber(req.params.idGroups)

    if (idGroupsStatus === false) {
      return res.status(422).json({
        code: 8840032,
        message: 'Id groups does not exist or is not valid'
      })
    }

    let dataResult
    await UsersAndGroups.getAllMember(idGroups)
      .then(([data]) => {
        dataResult = data
      })

    res.status(200).json({
      data: dataResult,
    })
  }

  addMember = async (req, res, next) => {
    const idUsers = req.idUsers
    // body gom idGroups, idUsers va emailMember
    const [idGroups, idGroupsStatus] = validateNumber(req.body.idGroups)
    const [emailMember, emailMemberStatus] = validateStringNotEmpty(req.body.emailMember.trim())

    if (idGroupsStatus === false || emailMemberStatus === false) {
      return res.status(422).json({
        code: 8840033,
        message: 'Id groups or email member does not exist or is not valid'
      })
    }

    if (req.email === emailMember) {
      return res.status(422).json({
        code: 8840034,
        message: 'You cannot add yourself to the group'
      })
    }

    // check quyen cua idUsers co phai la owner cua idGroups hay khong
    let isOwner = true
    await Groups.checkOwnerGroup(idGroups, idUsers)
      .then(([data]) => {
        isOwner = data.length !== 0
      })

    if (isOwner === false) {
      return res.status(422).json({
        code: 8840035,
        message: 'User does not own the group'
      })
    }

    // check emailMember co ton tai hay khong
    let dataUser
    await Users.getUserByEmail(emailMember)
      .then(([data]) => {
        dataUser = data
      })

    if (dataUser.length === 0) {
      return res.status(422).json({
        code: 8840036,
        message: 'Email member does not exist'
      })
    }

    let isExist = false
    await UsersAndGroups.checkExistMember(idGroups, dataUser[0].idUsers)
      .then(([data]) => {
        isExist = data.length !== 0
      })

    if (isExist === true) {
      return res.status(422).json({
        code: 8840037,
        message: 'Email member is already in the group'
      })
    }

    // add vao bang UsersAndGroups
    await new UsersAndGroups(dataUser[0].idUsers, idGroups, false, 1).save()

    res.status(200).json({
      message: 'Add member successfully',
    })
  }

  removeMember = async (req, res, next) => {
    const idUsers = req.idUsers

    const [idGroups, idGroupsStatus] = validateNumber(req.body.idGroups)
    const [idUsersMember, idUsersMemberStatus] = validateNumber(req.body.idUsersMember)

    if (idGroupsStatus === false || idUsersMemberStatus === false) {
      return res.status(422).json({
        code: 8840038,
        message: 'Id groups or id users member does not exist or is not valid'
      })
    }

    let isOwner = false
    await Groups.checkOwnerGroup(idGroups, idUsers)
      .then(([data]) => {
        isOwner = data.length !== 0
      })

    if (isOwner === false) {
      return res.status(422).json({
        code: 8840039,
        message: 'User does not own the group'
      })
    }

    await UsersAndGroups.deleteMember(idGroups, idUsersMember)

    res.status(200).json({
      message: 'Remove member successfully',
    })
  }
}

module.exports = new GroupController()