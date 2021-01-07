import { useEffect, useState } from 'react';
import axios from 'axios';

import { episode } from '../types/episodes';

export function useEpisodes(seasonId: string): episode[] {
  const [episodes, setEpisodes] = useState<episode[]>([]);
  useEffect(() => {
    const fetchEps = async function() {
      const response = await axios.get(`/api/episode/${seasonId}`);
      console.log(response);
      const reversedEpisodes = response.data.episodes.reverse();
      setEpisodes(reversedEpisodes);
    }
    fetchEps();
  }, []);
  return episodes;
}
