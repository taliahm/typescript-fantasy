import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Chip from "@material-ui/core/Chip";
import CheckIcon from "@material-ui/icons/Check";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { playersInLeagueNotTaken } from '../utils/sort';

import { User } from '../types/user';
import { Player } from '../types/player';
import { Team, TeamWithPlayers } from "../types/team";

interface EditTeamProps {
  user: User;
  fetchMe: Function;
  team: Team;
}

interface ParamTypes {
  leagueId: string;
}
// Need ALL the users and their teams in the league, 
// need to get league here with users populated, should just be teams though
function EditTeam({ user, fetchMe, team }:EditTeamProps):JSX.Element {
  const [name, setName] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [chosenPlayers, setChosenPlayers] = useState<string[]>([]);
  const [notAvailablePlayers, setNotAvailablePlayers] = useState<Player[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const { leagueId } = useParams<ParamTypes>();
  useEffect(() => {
      if (team) {
          setName(team.name)
          setChosenPlayers(team.players)
          setTeamId(team._id);
      }
  }, [team])
  useEffect(() => {
    const fetchPlayers = async () => {
      const leagueResponse = await axios.get(`/api/league/${leagueId}`);
      const notAvailablePlayers = playersInLeagueNotTaken(leagueResponse.data.teams, teamId);
      setPlayers(leagueResponse.data.playersInSeason);
      setNotAvailablePlayers(notAvailablePlayers);
    };
    fetchPlayers();
  }, [leagueId, teamId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newTeam = {
      players: chosenPlayers,
      name,
    };
    try {
      await axios.patch(`http://localhost:3000/api/team/${teamId}`, {
        ...newTeam,
        userId: user._id,
      });
      fetchMe();
      // TODO: ADD LOADING STUFF
      //   push(`/league/stats/${leagueId}`);
    } catch (e) {
      console.log(e);
    }
  };
  const handleCheckbox = (playerId: string) => {
    const value:string = playerId;
    if (chosenPlayers.includes(value)) {
      // REMOVE:
      const removed = chosenPlayers.filter((id) => id !== value);
      setChosenPlayers(removed);
      return;
    }
    const newPlayers = [...chosenPlayers, value];
    setChosenPlayers(newPlayers);
  };
  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Team Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <section>
        <h2>Pick your team members!</h2>
        {players.map((player) => {
          const notAvailable = notAvailablePlayers.find(
            (p) => p._id === player._id
          );
          if (notAvailable) return null;
          return (
            <div key={player._id}>
              <Chip
                onClick={() => handleCheckbox(player._id)}
                label={`${player.firstName} ${player.lastName}`}
                icon={
                  <CheckIcon
                    visibility={
                      chosenPlayers.includes(player._id) ? "visible" : "hidden"
                    }
                  />
                }
                clickable
                color={
                  chosenPlayers.includes(player._id) ? "primary" : "default"
                }
              />
            </div>
          );
        })}
        {notAvailablePlayers.map((np) => {
          console.log(np);
          return <Chip disabled label={`${np.firstName} ${np.lastName}`} />;
        })}
      </section>
      <Button color="primary" type="submit">Save Team!</Button>
    </form>
  );
}

export default EditTeam;
