const { verifyToken } = require('./tokenService');
const User = require('./models/User');

exports.isLoggedIn = async (req, res, next) => {
    const { cookies } = req;

    try {
        if (!cookies || !cookies.token) {
            res.status(403).json({ message: 'authorization required' });
            return;
        }
        const token = cookies.token;
        const userToken = await verifyToken(token);
        const user = await User.findById(userToken.id).populate(
                {
                    path: 'teams',
                    populate: {
                        path: 'league'
                    }
                }
            )
        req.user = user;
        next();
    } catch(e) {
        console.log(e);
    }
}
