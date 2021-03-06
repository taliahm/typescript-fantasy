import { Route, Link } from 'react-router-dom';
import axios from 'axios';
import React, { useState } from 'react';

import User from "./User";
import Team from "./Team";
import EditTeam from "./EditTeam.tsx";
import Episodes from "./Episodes.tsx";
import TeamStats from "./TeamStats.tsx";
import Player from "./Player.tsx";
import FindLeague from "./FindLeague.tsx";
import CreateLeague from "./CreateLeague.tsx";
import EditUser from './EditUser.tsx';
import CreatePlayer from './CreatePlayer.tsx';
import Role from './Role.tsx';

import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  anchor: {
    textDecoration: "none",
  },
  menuButton: {
    marginRight: '80%',
  },
});

function Main({ user, updateUser, fetchMe, leagueId, team, editRules }) {
  const [menu, setMenu] = useState(false);
  const classes = useStyles();

  const logout = async () => {
    axios.get("/api/logout");
    updateUser(null);
  };
  return (
    <>
      <AppBar>
        <Toolbar>
          <MenuIcon
            className={classes.menuButton}
            onClick={() => setMenu(!menu)}
          />
          <Button type="button" onClick={logout}>
            Logout
          </Button>
          <Avatar src={user.profilePic} />
        </Toolbar>
      </AppBar>
      {/* User already in league with a team, can do these things: */}
      <Drawer anchor="left" open={menu} onClose={() => setMenu(false)}>
         <List>
           <Role userRole={user.role} role="SUPERADMIN">
           <ListItem>
             <Link to="/create/player">Create a new player</Link>
           </ListItem>
           </Role>
        {user && user.teams.length !== 0 && (
          <>
              {editRules && (
                <ListItem button>
                  <Link className={classes.anchor} to="/scoring">
                    Edit Score for Players
                  </Link>
                </ListItem>
              )}
              <ListItem button>
                <Link
                  className={classes.anchor}
                  to={`/league/stats/${leagueId}`}
                >
                  See how your team is doing!
                </Link>
              </ListItem>
              <ListItem button>
                <Link
                  className={classes.anchor}
                  to={`/league/edit/${leagueId}`}
                >
                  Edit your team
                </Link>
              </ListItem>
              <ListItem button>
                <Link className={classes.anchor} to="/create/league">
                  Create a league
                </Link>
              </ListItem>
              <ListItem button>
                <Link className={classes.anchor} to="/find/league">
                  Find a league to join
                </Link>
              </ListItem>
              <ListItem button>
                <Link className={classes.anchor} to="/edit/user">
                  Edit your details
                </Link>
              </ListItem>
              </>
              )}
              {/* User with no league or team has to join a league and create a team */}
              {user && user.teams.length === 0 && (
                <>
                  <ListItem>
                    <Link to="/create/league">Create a league</Link>
                  </ListItem>
                  <ListItem>
                    <Link to="/find/league">Find a league to join</Link>
                  </ListItem>
                  <ListItem>
                    <Link to="/edit/user">Edit your details</Link>
                  </ListItem>
                </>
              )}
        </List>
      </Drawer>

      {/* This route is a problem because it creates orphan users without a league or team.... */}
      {/* START HERE for a new user */}
      <section>
        <Route
          exact
          path="/user"
          render={() => <User updateUser={updateUser} />}
        />
      </section>
      <section>
        {/* Get invite to join a league... create an empty team */}
        <Route
          path="/user/:leagueId"
          render={() => <Team user={user} updateUser={updateUser} />}
        />
      </section>
      {/* <section>
          <Route path="/edit/team" render={() => <Team userId={user._id} />} />
        </section> */}
      <section>
        <Route
          path="/league/stats/:leagueId"
          render={() => <TeamStats user={user} />}
        />
      </section>
      <section>
        <Route
          path="/league/edit/:leagueId"
          render={() => <EditTeam user={user} team={team} fetchMe={fetchMe} />}
        />
      </section>
      <section>
        <Route
          path="/league/:leagueId/player/:playerId"
          render={() => <Player user={user} />}
        />
      </section>
      <section>
        <Route
          path="/scoring"
          render={() => <Episodes user={user} leagueId={leagueId} />}
        />
      </section>
      <section>
        <Route
          path="/find/league"
          render={() => <FindLeague user={user} updateUser={updateUser} />}
        />
      </section>
      <section>
        <Route
          path="/create/league"
          render={() => <CreateLeague user={user} updateUser={updateUser} />}
        />
      </section>
      <section>
        <Route
          path="/edit/user"
          render={() => <EditUser user={user} updateUser={updateUser} />}
        />
      </section>
      <section>
        <Route path="/create/player" component={CreatePlayer} />
      </section>
    </>
  );
}

export default Main;