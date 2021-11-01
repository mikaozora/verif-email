const restify = require('restify')
const mongoose = require('mongoose')
const config = require('./config')
const pgrestify = require('pg-restify')

const server = restify.createServer()
server.use(restify.plugins.bodyParser())
// server.use(rjwt({secret: config.JWT_SECREET}).unless({path: ['/auth']}))
// server.use(require('./routes/userpsql'))

server.listen(config.PORT, () => {
    mongoose.connect(
        config.MONGODB_URL,
        { useNewUrlParser: true }
    )
    // console.log(`Server started on port ${config.PORT}`) 
})
mongoose.set('useUnifiedTopology', true);
const db = mongoose.connection;
db.on('error', (err) => console.log(err))
db.once('open', () => {
    require('./routes/customers')(server)
    require('./routes/users')(server)
    console.log(`Server started on port ${config.PORT}`);
})