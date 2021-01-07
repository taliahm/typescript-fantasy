const { verifyToken } = require('./tokenService');
const User = require('./models/User');
const Team = require('./models/Team');

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
                    options: {
                        sort: {'episodes.airDate': 1 }
                    },
                    populate: {
                        path: 'league'
                    }
                }
            )
        // Sort team episodes by air date.....
        // Need the leagues populated as well
        const sortedTeams = await Team.aggregate([
          {
            $match: { _id: { $in: user.teams } },
          },
          { $unwind: {path: "$episodes", preserveNullAndEmptyArrays: true }},
          { $sort: { "episodes.airDate": -1 } },
          {
            $group: {
              _id: "$_id",
              episodes: { $push: "$episodes" },
              team: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 1,
              episodes: 1,
              name: "$team.name",
              userPic: "$team.userPic",
              userName: "$team.userName",
              league: "$team.league",
            },
          },
          {
            $lookup: {
              from: "leagues",
              localField: "league",
              foreignField: "_id",
              as: "fromItem",
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                  $mergeObjects: ["$$ROOT", {
                      league: {$mergeObjects: [{ $arrayElemAt: ["$fromItem", 0]}]},
                  }],
              },
            },
          },
          { $project: { fromItem: 0 } },
        ]);
        const newUser = {...user._doc, teams: sortedTeams};
        req.user = newUser;
        next();
    } catch(e) {
        console.log(e);
    }
}

exports.requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            res.status(403).json({message: 'Not Authorized'})
            return
        }
        next();
    }
}
