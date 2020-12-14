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

import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import { User } from '../types/user';
import { PlayerWithEpisodes } from '../types/player';

interface TeamStatsProps {
  user: User,
}

interface TeamStatsParams {
  leagueId: string
}

function TeamStats({ user }:TeamStatsProps): JSX.Element {
    const [players, setPlayers] = useState<PlayerWithEpisodes[]>([]);
    const [sortedTeams, setSortedTeams] = useState([]);
    const { leagueId } = useParams<TeamStatsParams>();
    useEffect(() => {
        const fetchData = async () => {
        const response = await axios.get(
            "http://localhost:3000/api/players"
        );

        const teamsWithTotals = await axios.get(`/api/team/${leagueId}`)
        const episodeSorted = normalizeEpisodes(response.data, leagueId);

        setSortedTeams(teamsWithTotals.data.sorted);
        setPlayers(episodeSorted);
        };
      
        fetchData();
    }, []);
 
    const renderByEpisodeTableRows = (players) => {
      if (players.length === 0) return null;
      const tableRows = [];
      for (let i = 1; i <= 12; i++) {
        tableRows.push(
          <TableRow>
            <TableCell>{i}</TableCell>
            {players.map((player) => {
              const episode = player.sortedScores[`episodeNumber${i}`];
              if (!episode) return <TableCell>0</TableCell>;
              const total = episode.reduce((accum, curr) => {
                if (!curr.count) return accum;
                return accum + curr.pointValue * curr.count || 0;
              }, 0);
              const isEliminated = episode.find(e => e.eliminated === true);
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
      }
      return tableRows;
    };
    const renderTotalTableRow = (players) => {
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
                    {team.isCurrentUserTeam && <Typography>Your team!</Typography>}
                    <Typography variant="h3">{team.name}</Typography>
                    <Typography variant="h5">{team.userName}</Typography>
                    <Typography variant="h4">{team.teamTotal}</Typography>
                    <TableContainer size="small">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Player</TableCell>
                            <TableCell>Total Points</TableCell>
                          </TableRow>
                           </TableHead>
                           <TableBody>
                            {team.players.map((player) => {
                              return (
                                <TableRow>
                                <TableCell>{player.firstName}</TableCell>
                                <TableCell>{player.totalPoints}</TableCell>
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
        <TableContainer container>
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