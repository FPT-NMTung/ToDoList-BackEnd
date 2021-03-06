const db = require('../util/database')

module.exports = class Tasks {
  constructor(idGroups, name, status, type, isComplete, isDelete, member, author) {
    this.idGroups = idGroups
    this.name = name
    this.status = status
    this.type = type
    this.isComplete = isComplete
    this.isDelete = isDelete
    this.member = member
    this.author = author
  }

  static delete = (idTasks) => {
    return db.execute('DELETE FROM `Project_ToDoList`.`tasks` WHERE idTasks = ?;',
      [idTasks])
  }

  static getAllTasksForUser = (idGroups, idUsers) => {
    return db.execute('SELECT * FROM project_todolist.tasks where idGroups = 44 and JSON_CONTAINS(members, \'' + idUsers + '\');',
      [idGroups, idUsers])
  }

  save = () => {
    return db.execute('INSERT INTO `Project_ToDoList`.`Tasks`(`idGroups`,`name`,`status`,`type`,`isCompleted`,`isDelete`,`members`,`author`)VALUES(?,?,?,?,?,?,?,?);',
      [this.idGroups, this.name, this.status, this.type, this.isComplete, this.isDelete, this.member, this.author])
  }

  // static getAllTasksForAuthor = (idGroups, idUsers) => {
  //   return db.execute('SELECT * FROM `project_todolist`.`tasks` WHERE isDelete = 0 AND author = ?;',
  //     [idUsers])
  // }
}
