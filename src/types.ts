export type SearchOptions = {
  termos: boolean;
  episodios: boolean;
  hinos: boolean;
  ofudessaki: boolean;
  ossashizu: boolean;
};

export type SearchResult = {
  termos: Termo[];
  episodios: Episodio[];
  hinos: Hino[];
  ofudessaki: Ofudessaki[];
  ossashizu: Ossashizu[];
  error: string | null;
};

export interface Termo {
  romaji: string;
  kanji: string;
  significado: string;
}

export interface Episodio {
  episodio_numero: string;
  titulo_p: string;
  titulo_j: string;
  pagina: string;
  conteudo_p: string | null;
  conteudo_j: string | null;
}

export interface Verso {
  verso_numero: string;
  romaji: string | null;
  kanji: string | null;
  traducao: string | null;
}

export interface Hino {
  hino_romaji: string;
  hino_kanji: string;
  versos: Verso[];
}

export interface Ofudessaki {
  parte: string;
  versiculo: string;
  conteudo_j: string;
  conteudo_r: string;
  conteudo_p: string;
}

export interface Paragrafos {
  conteudo_jap: string;
  conteudo_port: string;
}

export interface Ossashizu {
  data_wareki: string;
  data: string;
  data_lunar: string;
  ano_RD: string;
  paragrafos: Paragrafos[];
}
