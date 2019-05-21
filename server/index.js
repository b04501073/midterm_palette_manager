const app = require('express')()

const server = require('http').Server(app)
const io = require('socket.io')(server)

const mongoose = require('mongoose')

const mongoDB = process.env.NODE_DEV !== 'production' ? 'mongodb://localhost:27017/palette' : 'mongodb://rainforest:abcd1234@192.168.0.143:32768/admin'

const PORT = process.env.PORT || 3000

const dev = process.env.NODE_DEV !== 'production'
const next = require('next')
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

const bodyParser = require('body-parser')

nextApp.prepare().then(() => {
  // Allows for cross origin domain request:
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  
  app.use('/api/palettes', require('./api/palettes'))

  // io.on('connection', socket => {
  //   socket.emit('init', {
  //     message: 'Home Page'
  //   })
  //   socket.on('add palette', data => {
  //     db.push(data)
  //     socket.broadcast.emit('new palette', data)
  //   })
  // })

  mongoose.Promise = Promise
  mongoose.connect(mongoDB, { 
    useNewUrlParser: true 
  })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))

  app.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(PORT, err => {
    if (err) throw err;
    console.log(`ready at http://localhost:${PORT}`)
  })
})