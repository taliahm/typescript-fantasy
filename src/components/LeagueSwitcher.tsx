import React from 'react';

import { League } from '../types/league';

interface LeagueSwitcherProps {
  leagues: League[],
  setLeagueId: Function,
}

function LeagueSwitcher({ leagues, setLeagueId }: LeagueSwitcherProps): JSX.Element {
  return (
    <>
      <h3>What league would you like to edit?</h3>
      <select onChange={(e) => setLeagueId(e.target.value)}>
        {leagues.map((league) => {
          return (
            <option value={league._id} key={league._id}>
              {league.leagueName}
            </option>
          );
        })}
      </select>
    </>
  );
}
  export default LeagueSwitcher;