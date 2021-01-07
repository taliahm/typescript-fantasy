import { Route, useRouteMatch, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Players from './Players';

import { episode } from '../types/episodes';

import { User } from '../types/user';
interface EpisodesProps {
  user: User,
  leagueId: string,
}

const seasonId = "5fa306ffcd21f61bcc9e464b";
// Taking Naive approach that every season has 12 episodes and only one season "active" at a time
function Episodes({ user, leagueId }: EpisodesProps): JSX.Element {
   const { path, url } = useRouteMatch();
   const [episodes, setEpisodes] = useState<episode[]>([]);
   useEffect(() => {
     async function fetchEpisodes() {
      const response = await axios.get(`/api/episode/${seasonId}`)
      console.log(response);
      const reversedEpisodes = response.data.episodes.reverse();
      setEpisodes(reversedEpisodes);
     }
     fetchEpisodes();
   }, [])
   const renderLinks = () => {
     return episodes.map(ep => {
      return (
        <li key={ep._id}>
          <Link to={`${url}/${ep.number}`}>Edit Episode {ep.number}</Link>
        </li>
      );
     })
   }
    return (
      <div>
        
        <ul>{renderLinks()}</ul>
        <Route path={`${path}/:episodeId`}>
          <Players
            ruleSet={user.teams ? user.teams[0].league?.rules : []}
            userId={user._id}
            leagueId={leagueId}
          />
        </Route>
      </div>
    );
}

export default Episodes;