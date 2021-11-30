const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const socketio = require('socket.io')
const app = express()

const server = http.createServer(app)
const io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  },
)

const UserRouter = require('./src/router/UserRouter')
const GroupRouter = require('./src/router/GroupRouter')
const TaskRouter = require('./src/router/TaskRouter')

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json({limit: '2mb'})) // application/json
// app.use(bodyParser.json({ limit: '5mb' }))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/api/user', UserRouter)
app.use('/api/group', GroupRouter)
app.use('/api/task', TaskRouter)

app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(status).json({message: message, data: data})
})

io.on('connection', (socket) => {
  // console.log('we have new connection')
})

server.listen(8080, () => {
  console.log('---=== Server started ===---')
})
