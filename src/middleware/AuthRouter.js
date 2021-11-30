const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const auth = req.get('Authorization')
  let statusToken;

  // check header
  if (!auth) {
    res.status(401).json({
      message: 'Not authenticated'
    })
    return
  }

  // get token from header
  const token = auth.split(' ')[1]

  // check valid token
  try {
    statusToken = jwt.verify(token, 'co-khong-giu-mat-dung-tim')
  } catch (e) {
    res.status(401).json({
      message: 'Not authenticated'
    })
    return
  }

  if (!statusToken) {
    res.status(401).json({
      message: 'Not authenticated'
    })
    return
  }

  req.idUsers = statusToken.idUsers
  req.email = statusToken.email
  req.name = statusToken.name
  next()
}