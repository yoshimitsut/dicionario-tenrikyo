// src/hooks/useFetchData.ts
import { useState, useEffect } from 'react';
import type { Termo, Episodio, Hino, Ofudessaki, Ossashizu } from '../types';

export function useFetchData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    termos: Termo[];
    episodios: Episodio[];
    hinos: Hino[];
    ofudessaki: Ofudessaki[];
    ossashizu: Ossashizu[];
  }>({
    termos: [],
    episodios: [],
    hinos: [],
    ofudessaki: [],
    ossashizu: [],
  });
  
  useEffect(() => {
    (async () => {
      try {
        const responses = await Promise.all([
          fetch('/data/works.json'),
          fetch('/data/itsuwahen.json'),
          fetch('/data/mikagurauta.json'),
          fetch('/data/ofudessaki.json'),
          fetch('/data/ossashizu.json')
        ]);
        const [termos, episodios, hinos, ofudessaki, ossashizu] = await Promise.all(responses.map(r => r.json()));
        setData({ termos, episodios, hinos, ofudessaki, ossashizu });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, data };
}
