const db = require('../util/database')

module.exports = class UsersAndGroups {
  constructor(idUsers, idGroups, isAuthor) {
    this.idUsers = idUsers
    this.idGroups = idGroups
    this.isAuthor = isAuthor
  }

  save = () => {
    return db.execute('INSERT INTO `Project_ToDoList`.`UsersAndGroups`(`idUsers`,`idGroups`,`isAdmin`)VALUES(?,?,?);',
      [this.idUsers, this.idGroups, this.isAuthor])
  }

  static getInfo = (idUsers, idGroups) => {
    return db.execute('select * from usersAndGroups inner join Project_ToDoList.groups on usersAndGroups.idGroups = Project_ToDoList.Groups.idGroups where isDelete = 0 and usersAndGroups.idUsers = ? and usersAndGroups.idGroups = ?',
      [idUsers, idGroups])
  }

  static getAllMember = (idGroups) => {
    return db.execute('select `project_todolist`.`users`.* from `project_todolist`.`usersandgroups` join `project_todolist`.`users` on `project_todolist`.`usersandgroups`.idUsers = `project_todolist`.`users`.idUsers where idGroups = ?;',
      [idGroups])
  }
}
