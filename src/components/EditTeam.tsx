import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from 'dayjs';
import axios from "axios";

import Role from './Role';

import Chip from "@material-ui/core/Chip";
import CheckIcon from "@material-ui/icons/Check";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";

import { playersInLeagueNotTaken } from '../utils/sort';

import { User, Roles } from '../types/user';
import { Player } from '../types/player';
import { Team, TeamEpisode } from "../types/team";


interface EditTeamProps {
  user: User;
  fetchMe: Function;
  team: Team;
}

interface ParamTypes {
  leagueId: string;
}

interface Episode {
  prevAirDate: Date,
  airDate: Date,
  _id: string,
  number: number,
  season: string,
}

const seasonId = '5fa306ffcd21f61bcc9e464b';
// Need ALL the users and their teams in the league, 
// need to get league here with users populated, should just be teams though
function EditTeam({ user, fetchMe, team }:EditTeamProps):JSX.Element {
  const [name, setName] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [chosenPlayers, setChosenPlayers] = useState<string[]>([]);
  const [notAvailablePlayers, setNotAvailablePlayers] = useState<Player[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [lockedDate, setLockedDate] = useState<Date | string>(new Date());
  const [locked, setLocked] = useState<boolean>(false);
  const [lockedLoading, setLockedLoading] = useState<boolean>(false);
  const [currentEpisode, setCurrentEpisode] = useState<null | Episode>(null);
  const [teamEpisodes, setTeamEpisodes] = useState<null | TeamEpisode[]>(null);
  const { leagueId } = useParams<ParamTypes>();
  useEffect(() => {
      if (team && currentEpisode) {
          setName(team.name)
          // setChosenPlayers(team.players)
          // Because we know that the first episode will be the most recent:
          const currentEpisodeTeam = team.episodes.filter(ep => {
            return ep.episodeId === currentEpisode._id;
          });
          setChosenPlayers(currentEpisodeTeam[0] ? currentEpisodeTeam[0].players : []);
          setTeamId(team._id);
          setTeamEpisodes(team.episodes)
      }
  }, [team, currentEpisode])
  useEffect(() => {
    const fetchEpisodes = async () => {
        const today = dayjs(new Date()).format('YYYY-MM-DD');
        const episode = await axios.get(`/api/episode/${seasonId}?date=${today}`);
        console.log(episode);
        setCurrentEpisode(episode.data.episode[0]);
    }
    fetchEpisodes();
  }, [seasonId])
  useEffect(() => {
    const fetchPlayers = async () => {
      const leagueResponse = await axios.get(`/api/league/${leagueId}?episodeId=${currentEpisode?._id}`);
      const notAvailablePlayers = playersInLeagueNotTaken(leagueResponse.data.teams, teamId, currentEpisode?._id);
      console.log(leagueResponse);
      const leagueLockDate = leagueResponse.data.league.locked ? formatDate(
        new Date(leagueResponse.data.league.locked)
      ) : formatDate(new Date);
      const leagueLocked = dayjs(leagueLockDate) > dayjs();
      setLockedDate(leagueLockDate);
      setLocked(leagueLocked)
      setPlayers(leagueResponse.data.playersInSeason);
      setNotAvailablePlayers(notAvailablePlayers);
    };
    if (teamId && leagueId && currentEpisode) {
      fetchPlayers();
    }
  }, [leagueId, teamId, currentEpisode]);

  const handleLocked = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setLockedLoading(true);
    await axios.post(`/api/league/lock`, {
      leagueId,
      lock: lockedDate,
    });
    setLockedLoading(false);
    if (dayjs(lockedDate) > dayjs()) {
      setLocked(true);
    } else {
      setLocked(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newTeamForEpisode = {
      players: chosenPlayers,
      airDate: currentEpisode?.airDate,
      number: currentEpisode?.number,
      episodeId: currentEpisode?._id,
    }
    try {
      await axios.patch(`http://localhost:3000/api/team/episode/${teamId}`, {
        ...newTeamForEpisode,
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
  const formatDate = (date: Date): string => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    const formattedTime = dayjs(date).format('hh:mm');
    return `${formattedDate}T${formattedTime}`;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Role userRole={user.role} role={Roles.admin}>
          {lockedLoading ? (
            <CircularProgress />
          ) : (
            <>
              <TextField
                id="datetime"
                label="Lock the League Until:"
                type="datetime-local"
                value={lockedDate}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) =>
                  setLockedDate(formatDate(new Date(e.target.value)))
                }
              />
              <Button
                color="primary"
                onClick={(e) => handleLocked(e)}
                type="button"
              >
                Save Date
              </Button>
              <div>
                <h3>Current League Status: {locked ? <LockIcon /> : <LockOpenIcon />}</h3>
              </div>
            </>
          )}
        </Role>
      </div>
      <TextField
        label="Team Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={locked}
      />
      <section>
        <h2>
          {locked
            ? `Here is your team, it is locked in until ${dayjs(lockedDate).format('dddd MMM DD YYYY')}!`
            : `Pick your team members for episode ${currentEpisode?.number} airing on ${dayjs(currentEpisode?.airDate).format('dddd MMM DD')}`}
        </h2>
        {players.map((player) => {
          console.log(player);
          const notAvailable = notAvailablePlayers.find(
            (p) => p._id === player._id
          );
          if (notAvailable) return null;
          return (
            <div key={player._id}>
              <Chip
                onClick={() => handleCheckbox(player._id)}
                disabled={locked}
                label={`${player.firstName} ${player.lastName} ${player.isEliminated && 'has been eliminated'}`}
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
        {!locked && (
          <Button color="primary" type="submit">
            Save Team!
          </Button>
        )}
        <h2>Players on other teams</h2>
        {notAvailablePlayers.map((np) => {
          return <Chip key={np._id} disabled label={`${np.firstName} ${np.lastName}`} />;
        })}
      </section>
    </form>
  );
}

export default EditTeam;
