import React, { useState } from 'react';
import axios from 'axios';

import { User } from '../types/user';

interface FindLeagueProps {
  updateUser: Function,
  user: User,
}

function FindLeague({ updateUser, user }: FindLeagueProps): JSX.Element {
    const [search, setSearch] = useState('');
    const [leagues, setLeagues] = useState([]);
 
    const joined = user && user.teams.map((t) => t.league._id);
    const searchLeagues = async () => {
        const res = await axios.get(`/api/league/search/${search}`)
        setLeagues(res.data);
    }
    const joinLeague = async (id: string) => {
        setSearch('');
        const res = await axios.patch(`/api/league/${id}`);
        updateUser(res.data);
    }
    return (
      <div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" onClick={searchLeagues}>
          Find the league
        </button>
        <section>
          {leagues.length !== 0 &&
            leagues.map(
              ({ leagueName, _id }) =>
                !joined.includes(_id) && (
                  <button key={_id} onClick={() => joinLeague(_id)}>
                    {leagueName}
                  </button>
                )
            )}
        </section>
        <section>
          <h2>You're in these leagues!</h2>
          {user && user.teams.map((t) => {
              return <p>{t.league.leagueName}</p>
          })}
        </section>
      </div>
    );
}

export default FindLeague;