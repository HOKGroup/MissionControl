const jwt = require('jsonwebtoken')

function verifyToken(req, res, cb) {
    console.log(process.env.USE_AZUREAD == 'true')
    if (process.env.USE_AZUREAD !== 'true') return cb(null, null)
    let token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1]
    } else {
        return res.status(401).send({ name: 'missingToken', message: 'No authorization token included in request' })
    }
    const pub = Buffer.from(process.env.AZUREAD_PUBLIC_KEY, 'base64').toString('utf-8')
    jwt.verify(token, pub, { algorithms: ['RS256'], issuer: process.env.AZUREAD_IDENTITIY_METADATA }, cb)
}

function protected(req, res, next) {
    verifyToken(req, res, (err, decoded) => {
        if (err) return res.status(401).send(err)
        req.user = decoded
        next()
    })
}

function requireRole(role) {
    return function (req, res, next) {
        // If req.user is already set (protected ran first), skip re-verification
        if (req.user !== undefined) {
            if (req.user && !req.user.roles?.includes(role)) {
                return res.status(403).send({ name: 'forbidden', message: `Role '${role}' required` })
            }
            return next()
        }
        verifyToken(req, res, (err, decoded) => {
            if (err) return res.status(401).send(err)
            req.user = decoded
            if (decoded && !decoded.roles?.includes(role)) {
                return res.status(403).send({ name: 'forbidden', message: `Role '${role}' required` })
            }
            next()
        })
    }
}

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin') // redirect to sign-in route
    }

    next()
}

module.exports = { protected, requireRole, isAuthenticated }