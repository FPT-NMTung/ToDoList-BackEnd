const db = require('../util/database')

module.exports = class Groups {
  constructor(name) {
    this.name = name
  }

  save = () => {
    return db.execute('INSERT INTO `Project_ToDoList`.`Groups` (`name`) VALUES (?);',
      [this.name])
  }

  static getALlGroup = (idUsers) => {
    return db.execute('select b.*, Users.name as "nameAdmin", Users.idUsers as "idUsersAdmin" from (select a.idGroups, a.name, UsersAndGroups.idUsers from (select UsersAndGroups.idUsersAndGroups, UsersAndGroups.idGroups, Project_ToDoList.Groups.name from UsersAndGroups inner join Project_ToDoList.Groups on UsersAndGroups.idGroups = Project_ToDoList.Groups.idGroups where idUsers = ? and isDelete = 0) as a inner join UsersAndGroups on a.idGroups = UsersAndGroups.idGroups where isAdmin = 1) as b inner join Users on b.idUsers = Users.idUsers',
      [idUsers])
  }

  static checkOwnerGroup = (idGroups, idUsers) => {
    return db.execute('select * from usersAndGroups where idUsers = ? and idGroups = ? and isAdmin = 1',
      [idUsers, idGroups])
  }

  static deleteGroup = (idGroups) => {
    return db.execute('UPDATE `project_todolist`.`groups` SET `isDelete` = 1 WHERE `idGroups` = ?',
      [idGroups])
  }
}