const jwt = require('jsonwebtoken');

const KEY = 'my mind starts misbehaving';

exports.createToken = (user) => {
    const token = jwt.sign(user, KEY, {expiresIn: '24h'});
    return token;
}

exports.verifyToken = (token) => {
    let user;
    jwt.verify(token, KEY, (err, decoded) => {
        if (err) {
            console.log(err);
        }

        user = decoded;
    })
    return user;
}