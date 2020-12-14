import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function Team({ user, updateUser }) {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState([]);
  const [chosenPlayers, setChosenPlayers] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const { leagueId } = useParams();
  const { push } = useHistory();
  useEffect(() => {
    const addUserToLeague = async () => {
      const response = await axios.patch(
        `http://localhost:3000/api/league/${leagueId}`,
        {
          userId: user._id,
        }
      );
      updateUser(response.data);
    };
    const hasTeamInLeague = !!user && user.teams?.find(t => {
      return t.league._id === leagueId
    });

    // user._id prevents the empty user from getting a team
    if (!user) return;
    if (!hasTeamInLeague && user._id) {
      addUserToLeague();
    } else if (hasTeamInLeague && user._id) {
      const team = user.teams.find((t) => t.league === leagueId);
      setTeamId(team._id);
    }
  }, [leagueId, user]);
  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await axios.get("http://localhost:3000/api/players");
      setPlayers(response.data);
    };
    fetchPlayers();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const team = {
      players: chosenPlayers,
      name,
    };
    try {

      const response = await axios.patch(`http://localhost:3000/api/user/team/${teamId}`, {
        ...team,
        userId: user._id,
      });
      updateUser(response.data);
      push(`/league/stats/${leagueId}`);
    } catch (e) {
      console.log(e);
    }
  };
  const handleCheckbox = (e) => {
    const value = e.target.value;
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
      <label htmlFor="name">Team Name</label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <section>
        <h2>Pick your team members!</h2>
        {players.map((player) => {
          return (
            <div key={player._id}>
              <label htmlFor={player._id}>
                {player.firstName}
                {player.lastName}
              </label>
              <input
                onChange={handleCheckbox}
                value={player._id}
                id={player._id}
                type="checkbox"
                checked={chosenPlayers.includes(player._id)}
              />
            </div>
          );
        })}
      </section>
      <button type="submit">Save Team!</button>
    </form>
  );
}

export default Team;