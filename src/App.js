import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
} from "react-router-dom";
import axios from 'axios';

import Main from './components/Main';
import LeagueSwitcher from './components/LeagueSwitcher.tsx';


import Signup from './components/SignUp';
import Login from './components/Login.tsx';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  
  const [leagueId, setLeagueId] = useState(null);
  const [team, setTeam] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editRules, setEditRules] = useState(false);
  const fetchMe = useCallback(async function() {
    const response = await axios.get('/api/me');
    console.log(response.data);
        // THIS NEEDS TO BE LEAGUE ID
        const leagueId = response.data.teams.length === 0 ? null : response.data.teams[0].league._id;
        console.log(leagueId);
        const leagues = response.data.teams.map((t) => {
          return t.league;
        })
        const editRules =
          response.data.teams.length === 0
            ? null
            : response.data.teams[0].league.useCustomScores;
        setUser(response.data);
        setLeagueId(leagueId);
        // this is WRONG, needs to be the team for the league
        setTeam(response.data.teams[0]);
        setTeams(response.data.teams);
        setLeagues(leagues);
        setEditRules(editRules);
  }, []);
  useEffect(() => {
      fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const currentTeam = teams.filter(t => {
      return t.league._id === leagueId;
    })
    const league = leagues.filter(l => l._id === leagueId)[0];
    setEditRules(league?.useCustomScores);
    if (teams.length !== 0) {
      setTeam(currentTeam[0]);
    }

  }, [leagueId])
  
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <ul></ul>
          </nav>
          <h1>Your Fantasy League</h1>
        </header>
            <Route
              path="/login"
              render={() => <Login fetchMe={fetchMe}/>}
            />
            <Route
              path="/signup"
              render={() => <Signup me={fetchMe} />}
            />
          <Route
            exact
            to="/"
            render={() => {
              if (!user) {
                return <Redirect to="/login" />;
              }
              return (
                <>
                  <Redirect to="/" />
                  {leagues.length > 1 && (
                    <LeagueSwitcher
                      setLeagueId={setLeagueId}
                      leagues={leagues}
                    />
                  )}
                  {team && <h2>{team.name}</h2>}
                  <Main
                    user={user}
                    fetchMe={fetchMe}
                    updateUser={setUser}
                    leagueId={leagueId}
                    team={team}
                    editRules={editRules}
                  />
                </>
              );
            } }/>
      </div>
    </Router>
  );
}

export default App;
