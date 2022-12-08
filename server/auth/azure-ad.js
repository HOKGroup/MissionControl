var jwt = require('jsonwebtoken')

module.exports = {
    protected: function (req, res, next) { 
        // Bypass if Azure AD authorization is not enabled
        if (process.env.USE_AZUREAD !== true) {
            next()
        }
        var token
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            token = req.headers.authorization.split(' ')[1]
        } else {
            return res.status(401).send({name: 'missingToken', message: 'No authorization token included in request'}) 
        }
        var pub = new Buffer.from(process.env.AZUREAD_PUBLIC_KEY, 'base64').toString('utf-8')
        jwt.verify(token, pub, { algorithms: ['RS256'], issuer: process.env.AZUREAD_IDENTITIY_METADATA }, function (err, _decoded) {
            if (err) {
                return res.status(401).send(err) 
            }
            next()
        })
    }
}