// src/hooks/useSearch.ts
import { useMemo, useState } from 'react';
import { tirarAcentos } from '../utils';
import type { Termo, Episodio, Hino, Ofudessaki, Ossashizu, SearchOptions } from '../types';

export function useSearch(
  data: {
    termos: Termo[];
    episodios: Episodio[];
    hinos: Hino[];
    ofudessaki: Ofudessaki[];
    ossashizu: Ossashizu[];
  },
  query: string,
  options: SearchOptions
) {
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!query.trim()) {
      return {
        termos: [],
        episodios: [],
        hinos: [],
        ofudessaki: [],
        ossashizu: [],
      };
    }

    if (!Object.values(options).some(Boolean)) {
      setError('Selecione pelo menos um tipo de busca');
      return {
        termos: [],
        episodios: [],
        hinos: [],
        ofudessaki: [],
        ossashizu: [],
      };
    }

    setError(null);
    const norm = tirarAcentos(query);

    return {
      termos: options.termos
        ? data.termos.filter(t =>
            tirarAcentos(t.romaji).includes(norm) ||
            tirarAcentos(t.significado).includes(norm) ||
            tirarAcentos(t.kanji).includes(norm)
          )
        : [],
      episodios: options.episodios
        ? data.episodios.filter(e =>
            tirarAcentos(e.episodio_numero).includes(norm) ||
            tirarAcentos(e.titulo_p).includes(norm) ||
            tirarAcentos(e.titulo_j).includes(norm) ||
            tirarAcentos(e.conteudo_p ?? '').includes(norm) ||
            tirarAcentos(e.conteudo_j ?? '').includes(norm)
          )
        : [],
      hinos: options.hinos
        ? data.hinos
            .map(hino => {
              const tituloCombina =
                tirarAcentos(hino.hino_romaji).includes(norm) ||
                tirarAcentos(hino.hino_kanji).includes(norm);
              const versosFiltrados = hino.versos.filter(v =>
                tirarAcentos(v.romaji ?? '').includes(norm) ||
                tirarAcentos(v.kanji ?? '').includes(norm) ||
                tirarAcentos(v.traducao ?? '').includes(norm)
              );
              if (tituloCombina) return hino;
              if (versosFiltrados.length > 0) return { ...hino, versos: versosFiltrados };
              return null;
            })
            .filter(Boolean) as Hino[]
        : [],
      ofudessaki: options.ofudessaki
        ? data.ofudessaki.filter(o =>
            tirarAcentos(o.parte).includes(norm) ||
            tirarAcentos(o.versiculo).includes(norm) ||
            tirarAcentos(o.conteudo_j).includes(norm) ||
            tirarAcentos(o.conteudo_r).includes(norm) ||
            tirarAcentos(o.conteudo_p).includes(norm)
          )
        : [],
      ossashizu: options.ossashizu
        ? data.ossashizu
            .map(os => {
              const datasCombina =
                tirarAcentos(os.data_wareki).includes(norm) ||
                tirarAcentos(os.data).includes(norm) ||
                tirarAcentos(os.data_lunar).includes(norm) ||
                tirarAcentos(os.ano_RD).includes(norm);
              const paragrafosFiltrados = os.paragrafos.filter(p =>
                tirarAcentos(p.conteudo_port).includes(norm) ||
                tirarAcentos(p.conteudo_jap).includes(norm)
              );
              if (datasCombina) return os;
              if (paragrafosFiltrados.length > 0) return { ...os, paragrafos: paragrafosFiltrados };
              return null;
            })
            .filter(Boolean) as Ossashizu[]
        : [],
    };
  }, [query, data, options]);

  return { ...result, error };
}
