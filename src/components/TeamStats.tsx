import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { normalizeEpisodes } from "../utils/sort";

import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import Avatar from "@material-ui/core/Avatar";

import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import { useEpisodes } from '../hooks/useEpisodes';

import { User } from '../types/user';
import { PlayerWithEpisodes } from '../types/player';
import { TeamWithPlayersWithScores } from '../types/team';
import { episode } from '../types/episodes';

interface TeamStatsProps {
  user: User,
}

interface TeamStatsParams {
  leagueId: string
}

const seasonId = "5fa306ffcd21f61bcc9e464b";

function TeamStats({ user }:TeamStatsProps): JSX.Element {
    const [players, setPlayers] = useState<PlayerWithEpisodes[]>([]);
    const [sortedTeams, setSortedTeams] = useState<TeamWithPlayersWithScores[]>(
      []
    );
    const episodes = useEpisodes(seasonId);
    console.log(episodes);
    const { leagueId } = useParams<TeamStatsParams>();
    useEffect(() => {
        const fetchData = async () => {
        const response = await axios.get(
            "http://localhost:3000/api/players"
        );
        
        const teamsWithTotals = await axios.get(`/api/team/${leagueId}`)
        console.log(teamsWithTotals);
        const episodeSorted = normalizeEpisodes(response.data, leagueId);
        console.log(episodeSorted);
        setSortedTeams(teamsWithTotals.data.sorted);
        setPlayers(episodeSorted);
        };
      
        fetchData();
    }, []);
    
 
    const renderByEpisodeTableRows = (players: PlayerWithEpisodes[]) => {
      if (players.length === 0) return null;
      return episodes.map((ep) => {
        return (
          <TableRow>
            <TableCell>{ep.number}</TableCell>
            {players.map((player) => {
              const episode = player.sortedScores[`episodeNumber${ep.number}`];
              if (!episode) return <TableCell>0</TableCell>;
              const total = episode.reduce((accum, curr) => {
                if (!curr.count) return accum;
                return accum + curr.pointValue * curr.count || 0;
              }, 0);
              const isEliminated = episode.find((e) => e.eliminated === true);
              if (!!isEliminated) {
                return (
                  <TableCell>
                    {total}
                    <p>Eliminated!</p>
                  </TableCell>
                );
              }
              return <TableCell>{total}</TableCell>;
            })}
          </TableRow>
        );
      })
    };
    const renderTotalTableRow = (players: PlayerWithEpisodes[]) => {
        return (
            <TableRow>
                <TableCell>Totals</TableCell>
                {players.map((player) => {
                  let sum = 0;
                  for (let episode in player.sortedScores) {
                    const arr = player.sortedScores[episode];
                    const epiTotal = arr.reduce((accum, curr) => {
                      if (!curr.count) return accum;
                      return accum + curr.pointValue * (curr.count || 0);
                    }, 0)
                    sum = epiTotal + sum;
                  }
                    return <TableCell>{sum}</TableCell>;
                })}
        </TableRow>
        )
    }
    return (
      <div>
        <h2>Team standing:</h2>
        <Grid container spacing={4}>
          {sortedTeams.map((team, i) => {
            return (
              <Grid item>
                <Card>
                  <CardContent>
                    {i === 0 && <Typography>Current Leader!</Typography>}
                    {team.isCurrentUserTeam && (
                      <Typography>Your team!</Typography>
                    )}
                    <Typography variant="h3">{team.name}</Typography>
                    <Typography variant="h5">
                      <Avatar src={team.userPic} />
                      {team.userName}
                    </Typography>
                    <Typography variant="h4">{team.teamTotal}</Typography>
                    <TableContainer component="div">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Episode</TableCell>
                            <TableCell>Players</TableCell>
                            <TableCell>Total Points</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {team.episodes.map((episode) => {
                            return (
                              <TableRow>
                                  <TableCell>{episode.number}</TableCell>
                                  <TableCell>{episode.players.map((pl, i, arr) => `${pl.firstName}${i === arr.length - 1 ? '' : ', ' }`)}</TableCell>
                                  <TableCell>{episode.total}</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        <h2>Overall Standings</h2>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Episode</TableCell>
                {players.map((player) => {
                  return (
                    <TableCell>
                      <Link to={`/league/${leagueId}/player/${player._id}`}>
                        {player.firstName}
                      </Link>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* row */}
              {renderByEpisodeTableRows(players)}
              {renderTotalTableRow(players)}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
}

export default TeamStats;