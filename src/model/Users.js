const db = require('../util/database')

module.exports = class Users {
  constructor(name, email, password, tokenActiveAccount) {
    this.name = name
    this.email = email
    this.password = password
    this.tokenActiveAccount = tokenActiveAccount
  }

  save() {
    db.execute('INSERT INTO Users (`name`,`email`,`password`, `tokenActiveAccount`) VALUES (?, ?, ?, ?)',
      [this.name, this.email, this.password, this.tokenActiveAccount])
  }

  update(idUsers) {
    db.execute('UPDATE `Project_ToDoList`.`Users` SET `name` = ?, `email` = ?, `password` = ? WHERE `idUsers` = ?;',
      [this.name, this.email, this.password, idUsers])
  }

  static getAll = () => {
    return db.execute('select * from Users')
  }

  static getUserById = (id) => {
    return db.execute('select * from Users where idUsers = ?', [id])
  }

  static getUserByEmail = (email) => {
    return db.execute('select * from Users where email = ?', [email])
  }

  static updateTokenResetPassword = (token, time, id) => {
    return db.execute('UPDATE `Project_ToDoList`.`Users` SET `tokenResetPassword` = ?, `tokenResetPasswordExp` = ? WHERE `idUsers` = ?;',
      [token, time, id])
  }

  static getUserByTokenResetPass = (tokenResetPass) => {
    return db.execute('select * from Users where tokenResetPassword = ?',
      [tokenResetPass])
  }

  static updatePasswordByTokenReset = (pass, id) => {
    return db.execute('UPDATE `Project_ToDoList`.`Users` SET `password` = ?, `tokenResetPassword` = ?, `tokenResetPasswordExp` = ? WHERE `idUsers` = ?;',
      [pass, null, null, id])
  }

  static getUserByTokenActiveAccount = (token) => {
    return db.execute('select * from Users where tokenActiveAccount = ?',
      [token])
  }

  static activeAccount = (id) => {
    return db.execute('UPDATE `Project_ToDoList`.`Users` SET `tokenActiveAccount` = null WHERE `idUsers` = ?;',
      [id])
  }

  static changeAvatar = (image, id) => {
    return db.execute('UPDATE `Project_ToDoList`.`Users` SET `avatar` = ? WHERE `idUsers` = ?;',
      [image, id])
  }
}