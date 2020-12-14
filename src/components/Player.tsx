import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { normalizePlayer } from "../utils/sort";

import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import Paper from "@material-ui/core/Paper";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";

import { PlayerNormalized } from "../types/player";

interface PlayerParams {
  leagueId: string,
  playerId: string,
}

function PlayerComponent(): JSX.Element {
    const { leagueId, playerId } = useParams<PlayerParams>();
    const [player, setPlayer] = useState<PlayerNormalized | null>(null);
    useEffect(() => {
        const fetchData = async () => {
          await axios.get(`http://localhost:3000/api/league/${leagueId}`);
          const playerResponse = await axios.get(
            `http://localhost:3000/api/players/${playerId}?leagueId=${leagueId}`
          );
          const normalized = normalizePlayer(playerResponse.data);
          setPlayer(normalized);
        }
        fetchData();
    }, [leagueId, playerId])
    const renderEpisodes = () => {
      const toRender = [];
      if (!player) return;
      for (let epi in player.organizedEps) {
      toRender.push(<TableRow>What was {player.firstName} up to in Episode {player.organizedEps[epi][0].episodeNumber}</TableRow>);
        const episode = player.organizedEps[epi].map((epi) => {
          return (
            <TableRow>
              <TableCell>{epi.text}</TableCell>
              <TableCell>{epi.count}</TableCell>
              <TableCell>{epi.count * epi.pointValue}</TableCell>
            </TableRow>
          )
        })
        toRender.push(episode);
      }
      return toRender;
    }
    return (
      <div>
        {player && (
          <>
            <h2>{player.firstName}</h2>
            <p>
              {player.isEliminated
                ? "This player has been eliminated"
                : "This player is still in the game!"}
            </p>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Total Points</TableCell>
                  </TableRow>
                </TableHead>
                {renderEpisodes()}
              </Table>
            </TableContainer>
          </>
        )}
      </div>
    );
}

export default PlayerComponent;