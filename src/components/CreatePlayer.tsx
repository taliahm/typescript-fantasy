import { useState, useEffect } from "react";
import axios from 'axios';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

function CreatePlayer(): JSX.Element{
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('')
  const handleSave = async () => {
    const response = await axios.post('/api/players', {
      firstName,
      lastName
    })
    console.log(response);
    setFirstName('')
    setLastName('');
  }
  return (
    <div>
      <h2>Create Player</h2>
      <TextField
        value={firstName}
        label="First Name"
        onChange={(e) => setFirstName(e.target.value)}
      />
      <TextField
      label="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <Button onClick={handleSave} type="button">Save</Button>
    </div>
  );
}

export default CreatePlayer;