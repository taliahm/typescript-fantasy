import { Route, useRouteMatch, Link } from 'react-router-dom';
import React from 'react';
import Players from './Players';

import { User } from '../types/user';
interface EpisodesProps {
  user: User,
  leagueId: string,
}
// Taking Naive approach that every season has 12 episodes and only one season "active" at a time
function Episodes({ user, leagueId }: EpisodesProps): JSX.Element {
   const { path, url } = useRouteMatch();
   const renderLinks = () => {
       const links = [];
       for (let i = 1; i <= 12; i++) {
       links.push(
         <li key={i}>
           <Link to={`${url}/${i}`}>Edit Episode {i}</Link>
         </li>
       );
       }
       return links;
   }
    return (
      <div>
        
        <ul>{renderLinks()}</ul>
        <Route path={`${path}/:episodeId`}>
          <Players
            ruleSet={user.teams ? user.teams[0].league.rules : []}
            userId={user._id}
            leagueId={leagueId}
          />
        </Route>
      </div>
    );
}

export default Episodes;