import axios from 'axios';
import React from 'react';

import './Rule.css';

import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

function Rule({
  rule,
  epNumber,
  playerId,
  updateScores,
  hasRule,
  playerRule,
  leagueId
}) {

  let count = 0;
  if (hasRule) {
    count = playerRule.count;
  }
  const handleAdd = async () => {
    const body = {
      playerId,
      epNumber,
      leagueId,
    };
    if (hasRule) {
      body.text = playerRule.text;
      body.pointValue = playerRule.pointValue;
      body.ruleId = playerRule._id;
      const response = await axios.post("/api/players/score", {
        ...body,
      });
      updateScores(response.data);
    } else {
      body.text = rule.text;
      body.pointValue = rule.pointValue;
      body.ruleId = rule._id;
      const response = await axios.post("/api/players/score", {
        ...body,
      });
      updateScores(response.data);
    }
  };
  return (
    <TableRow>
      <TableCell>
        <p>{rule.pointValue}</p>
      </TableCell>
      <TableCell>
        <h4>{rule.text}</h4>
      </TableCell>
      <TableCell>
        <p>{count}</p>
      </TableCell>
      <TableCell>
        <button type="button" onClick={handleAdd}>
          Add!
        </button>
      </TableCell>
    </TableRow>
  );
}

export default Rule;