import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Rule from './Rule';
import { normalizeEpisodes } from '../utils/sort';


// Material UI
import Grid from '@material-ui/core/Grid';
import Table from "@material-ui/core/Table";

import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

import { Score, PlayerWithEpisodes } from "../types/player";

interface PlayersProp {
  userId: string,
  ruleSet: Score[],
  leagueId: string,
}

interface PlayersParams {
  episodeId: string
}

function Players({ userId, ruleSet, leagueId }: PlayersProp): JSX.Element {
    const [players, setPlayers] = useState<PlayerWithEpisodes[]>([]);
    const [toUpdate, setToUpdate] = useState(false);
    const { episodeId } = useParams<PlayersParams>();
      useEffect(() => {
        const fetchData = async () => {
          const response = await axios.get(`http://localhost:3000/api/players?leagueId=${leagueId}`);

          const episodeSorted = normalizeEpisodes(response.data, leagueId);
          setPlayers(episodeSorted);
        };
        fetchData();
      }, [toUpdate, leagueId]);
      const updateScores = () => {
        setToUpdate(!toUpdate);
      }

      const hasRule = (ruleId: string, player: PlayerWithEpisodes) => {
        return !!getPlayerRuleForEpisode(ruleId, player);
      }

      const getPlayerRuleForEpisode = (ruleId: string, player: PlayerWithEpisodes) => {
        const episodeRules = player.sortedScores[`episodeNumber${episodeId}`]; 
        if (!episodeRules) {
          return null;
        }
        return episodeRules.find((cpr) => cpr._id === ruleId);
      };
      // const [eliminated, setEliminated] = useState(false);
      const confirmElimination = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        playerId: string,
        eliminated: boolean
      ) => {
        const body = {
          eliminated,
          playerId,
          epNumber: episodeId,
          pointValue: 0,
          text: "Elimination",
          leagueId,
        };
        const response = await axios.post("/api/players/eliminated", {
          ...body,
        });
        const normalized = normalizeEpisodes(response.data, leagueId);
        setPlayers(normalized);
      };
      return (
        <section className="players">
          <h2>Scoring for Episode {episodeId}</h2>
          <Grid container spacing={2}>
            {players.map((player) => {
              if (player.isEliminated) return;
              return (
                <Grid item key={player._id}>
                  <h3>
                    {player.firstName}
                    {player.lastName}
                  </h3>
                  <div>
                    <button
                      onClick={(e) => confirmElimination(e, player._id, true)}
                    >
                      Eliminate?
                    </button>
                    <p>
                      You won't be able to add points after they've been
                      eliminated!
                    </p>
                  </div>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            Points
                          </TableCell>
                          <TableCell>
                            Rule
                          </TableCell>
                          <TableCell>
                            Count
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ruleSet.map((rule) => (
                          <Rule
                            hasRule={hasRule(rule._id, player)}
                            playerRule={getPlayerRuleForEpisode(
                              rule._id,
                              player
                            )}
                            key={rule.text}
                            rule={rule}
                            epNumber={episodeId}
                            updateScores={updateScores}
                            playerId={player._id}
                            leagueId={leagueId}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              );
            })}
          </Grid>
          <Grid container spacing={2}>
            {players.map((player) => {
              if (!player.isEliminated) return;
              return (
                <Grid item key={player._id}>
                  <h3>
                    {player.firstName}
                    {player.lastName}
                  </h3>
                  <p>Has this player returned?</p>
                  <div>
                    <button
                      onClick={(e) => confirmElimination(e, player._id, false)}
                    >
                      Un-eliminate?
                    </button>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </section>
      );
}

export default Players;