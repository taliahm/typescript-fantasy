import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';

function Signup({ me }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirsName] = useState("");
  const [lastName, setLastName] = useState("");
  const signup = async () => {
    await axios.post('/api/user', {
      email,
      password,
      firstName,
      lastName,
    })
    me();
  }
  return (
    <div>
      <h2>SignUp</h2>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirsName(e.target.value)}
        placeholder="first name"
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="last name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button type="submit" onClick={signup}>
        Signup!
      </button>
      <Link to="/login">Already have an account? Sign in</Link>
    </div>
  );
}

export default Signup;