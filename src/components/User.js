import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

function User({updateUser}) {
  const history = useHistory();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = async (e) => {
        console.log(e);
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/user', {
                lastName,
                firstName,
                email,
                password,
                teams: [],
            })
            updateUser(response.data);
            history.push('/');
        } catch(e) {
            console.log(e);
        }
    }
    return (
      <section>
        <h2>Create Your User</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Make my user!</button>
        </form>
      </section>
    );
}

export default User;