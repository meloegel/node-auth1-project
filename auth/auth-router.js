const bcryptjs = require('bcryptjs')
const router = require('express').Router();
const Users = require('../users/users-model')

router.post('/register', (req, res) => {
    let cred = req.body
    const rounds = process.env.HASH_ROUNDS || 12;
    const hash = bcryptjs.hashSync(cred.password, rounds)
    cred.password = hash
    Users.add(cred)
        .then(saved => {
            res.status(200).json(saved)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'error' })
        })
})

router.post('/login', (req, res) => {
    const { username, password } = req.body
    Users.findBy({ username })
        .then(users => {
            const user = users[0]
            if (user && bcryptjs.compareSync(password, user.password)) {
                req.session.loggedIn = true
                req.session.username = user.username
                res.status(200).json({ message: 'Now logged in', session: req.session })
            } else {
                res.status(401).json({ message: 'Invalid Credentials' })
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'error' })
        })
})

router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(error => {
            if (error) {
                console.log(error)
                res.status(500).json({ error: 'Try loggin in later' })
            } else {
                res.status(204).end()
            }
        })
        res.status(204).end()
    } else {
        res.status(200).json({ messgae: 'Already logged out' })
    }
})

module.exports = router