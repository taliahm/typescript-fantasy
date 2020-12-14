import axios from 'axios';
import React, { useState } from 'react';

import rules from '../utils/rules';


function CreateLeague(): JSX.Element {
  const [name, setName] = useState("");
  const [customScores, setCustomScores] = useState(true);
  const handleSubmit = async () => {
    const body = {
      rules: rules,
      seasonId: "5fa306ffcd21f61bcc9e464b",
      leagueName: name,
      useCustomScores: customScores,
    };
    await axios.post("/api/league", { ...body });
    setName("");
  };
  return (
    <div>
      <input
        value={name}
        type="text"
        onChange={(e) => setName(e.target.value)}
      />
      <p>This league will use the default rules, read more here</p>
      <label htmlFor="customScores"> Score your own season or use ours?</label>
      <input
        type="checkbox"
        id="customScores"
        checked={customScores}
        onChange={() => setCustomScores(!customScores)}
      />
      <button onClick={handleSubmit}>Create league!</button>
    </div>
  );
}

export default CreateLeague;