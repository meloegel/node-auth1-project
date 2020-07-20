const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)
const dbConnection = require('./data/db-config')
const authenticate = require('./auth/auth-middleware')

const usersRouter = require('./users/users-router')
const authRouter = require('./auth/auth-router')

const server = express()

const sessionConfig = {
    name: 'Users',
    secret: process.env.SESSION_SECRET || 'keep it secret, keep it safe',
    cookie: {
        maxAge: 1000 * 60 * 10,
        secure: process.env.USE_SECURE_COOKIES || false,
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: true,
    store: new KnexSessionStore({
        knex: dbConnection,
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000 * 60 * 30,
    }),
}

server.use(session(sessionConfig))
server.use(helmet())
server.use(express.json())
server.use(cors())

server.use('/api/users', authenticate, usersRouter)
server.use('/api/auth', authRouter)

server.get('/', (req, res) => {
    res.status(200).json({ message: 'Its working' })
})

module.exports = server