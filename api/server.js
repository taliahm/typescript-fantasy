const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const Season = require('./models/Season');

const userRoutes = require('./routes/user');
const playersRoutes = require('./routes/players');
const leagueRoutes = require('./routes/league');
const teamRoutes = require('./routes/team');

const { isLoggedIn } = require('./middleware');

const uri = "mongodb://localhost:27017/fantasy";
mongoose
  .connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`Successfully connected to: ${uri}`);
  })
  .catch((err) => console.log(err.message));

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());


app.use("/api/user", userRoutes);
app.use("/api/players", playersRoutes);
app.use("/api/league", leagueRoutes);
app.use("/api/team", teamRoutes);

app.get('/api/me', isLoggedIn, async (req, res) => {
    try {
        res.json(req.user);
    } catch(e) {
        console.log(e);
    }
})


app.get('/', async (req, res) => {
    const season = new Season({
        seasonNumber: 1,
        name: 'Bacherlotte',
    })
   try {
        const doc = await season.save();
        res.json(doc)
   } catch(e) {
       console.log(e)
   }
    
})

// Am I using this?
// app.get('/add/episode', async (req, res) => {
//     try {
//         const episode = {
//           number: 1,
//           scores: [
//             { count: 0, point: 1, text: "wore a hat" },
//           ],
//           season: "5fa306ffcd21f61bcc9e464b",
//         };
//         const doc = await Player.update(
//           { _id: "5fa30a0df54bb81d25e7311f" },
//           { $push: { episodes: episode } }
//         );
//         res.json(doc)
//     } catch(e) {
//         console.log(e);
//     }
// })

// Am I using this?
// app.get('/add/team', async (req, res) => {
//     const userId = "5fa31599621e5322f5039014";
//     const playerId = "5fa315ec1ba7bf231ebff129";
//     const team = {
//       ruleSet: [
//         {
//           pointValue: 2,
//           text: "first kiss",
//         },
//       ],
//       name: "We are friends",
//       players: [playerId],
//     };
//     try {
//         const doc = await User.updateOne({ _id: userId }, {
//             $push: { teams: team },
//         });
//         res.json(doc);
//     } catch(e) {
//         console.log(e);
//     }
// })


app.listen(4000, () => {
    console.log('server listening on port 4000');
})


// COOL SHIT:
//  const doc = await Player.update(
//    { _id: "5fa30a0df54bb81d25e7311f" },
//    { $push: { episodes: { scores: score } } }
//  );
// has a lot of good filtering logic: https://stackoverflow.com/questions/30058941/how-to-use-not-equal-operator-in-mongoose-mongodb