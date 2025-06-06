import { useEffect, useState, useRef } from 'react';

interface Termo {
  romaji: string;
  kanji: string;
  significado: string;
}

interface Episodio {
  episodio_numero: string;
  titulo_p: string;
  titulo_j: string;
  pagina: string;
  conteudo_p: string | null;
  conteudo_j: string | null;
}

function tirarAcentos(texto: string | null | undefined): string {
  if (typeof texto !== 'string') return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function destacarTexto(texto: string | null | undefined, termo: string): React.ReactNode {
  if (!texto || !termo) return texto;

  const termoSemAcento = tirarAcentos(termo);
  const textoSemAcento = tirarAcentos(texto);

  const regex = new RegExp(termoSemAcento.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const partes: React.ReactNode[] = [];

  let lastIndex = 0;
  let match;
  let indexKey = 0;

  while ((match = regex.exec(textoSemAcento)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;

    const realStart = texto.slice(lastIndex).search(new RegExp(termo, 'i')) + lastIndex;

    if (realStart < 0) break;

    partes.push(<span key={`texto-${indexKey}`}>{texto.slice(lastIndex, realStart)}</span>);
    indexKey++;

    partes.push(
      <mark key={`destacado-${indexKey}`} style={{ backgroundColor: 'yellow', color: 'black' }}>
        {texto.slice(realStart, realStart + termo.length)}
      </mark>
    );
    indexKey++;

    lastIndex = realStart + termo.length;
  }

  partes.push(<span key={`final-${indexKey}`}>{texto.slice(lastIndex)}</span>);

  return <>{partes}</>;
}




function App() {
  const [termos, setTermos] = useState<Termo[]>([]);
  const [episodios, setEpisodios] = useState<Episodio[]>([]);

  const [query, setQuery] = useState('');
  const [filteredTermos, setFilteredTermos] = useState<Termo[]>([]);
  const [filteredEpisodios, setFilteredEpisodios] = useState<Episodio[]>([]);

  const [buscarTermos, setBuscarTermos] = useState(true);
  const [buscarEpisodios, setBuscarEpisodios] = useState(false);
  const [loading, setLoading] = useState(false);

  const botaoRef = useRef<HTMLButtonElement>(null);

  // Carrega os dados JSON apenas uma vez, sem filtrar nada
  useEffect(() => {
    const fetchJSON = async () => {
      try {
        setLoading(true);
        const termosResponse = await fetch('/data/works.json');
        const episodiosResponse = await fetch('/data/itsuwahen.json');

        if (!termosResponse.ok || !episodiosResponse.ok) {
          throw new Error('Erro ao carregar JSON');
        }

        const termosData: Termo[] = await termosResponse.json();
        const episodiosData: Episodio[] = await episodiosResponse.json();

        setTermos(termosData);
        setEpisodios(episodiosData);

        // NÃO mostrar resultados automaticamente:
        setFilteredTermos([]);
        setFilteredEpisodios([]);
      } catch (error) {
        console.error('Erro ao carregar JSON:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJSON();
  }, []);

  const filtrar = () => {
    const normalizado = tirarAcentos(query);

    if (!query.trim()) {
      setFilteredTermos([]);
      setFilteredEpisodios([]);
      return;
    }

    if (buscarTermos) {
      const filtrados = termos.filter(
        (termo) =>
          tirarAcentos(termo.romaji).includes(normalizado) ||
          termo.kanji.includes(query) ||
          tirarAcentos(termo.significado).includes(normalizado)
      );
      setFilteredTermos(filtrados);
    } else {
      setFilteredTermos([]);
    }

    if (buscarEpisodios) {
      const filtrados = episodios.filter(
        (e) =>
          tirarAcentos(e.titulo_p).includes(normalizado) ||
          e.titulo_j.includes(query) ||
          (e.conteudo_p && tirarAcentos(e.conteudo_p).includes(normalizado)) ||
          (e.conteudo_j && e.conteudo_j.includes(query))
      );
      setFilteredEpisodios(filtrados);
    } else {
      setFilteredEpisodios([]);
    }
  };

  // Pressionar ENTER chama o botão
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        botaoRef.current?.click();
      }
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  }, []);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '890px' }}>
      <h1 style={{ fontSize: '3rem', textAlign: 'center' }}>Dicionário da Tenrikyo</h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <label>
          <input type="checkbox" checked={buscarTermos} onChange={(e) => setBuscarTermos(e.target.checked)} />
          Buscar Termos
        </label>
        <label>
          <input type="checkbox" checked={buscarEpisodios} onChange={(e) => setBuscarEpisodios(e.target.checked)} />
          Episódios da Vida de Oyassama
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <input
          type="text"
          value={query}
          placeholder="Digite para buscar..."
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '0.5rem', width: '20rem' }}
        />
        <button ref={botaoRef} onClick={filtrar} style={{ padding: '0.5rem 1rem' }}>
          Pesquisar
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          {filteredTermos.length > 0 && (
            <ul>
              {filteredTermos.map((termo, i) => (
                <li key={i}>
                  <strong>{destacarTexto(termo.romaji, query)}</strong> ({destacarTexto(termo.kanji, query)}):<br />
                  {destacarTexto(termo.significado, query)}
                </li>
              ))}
            </ul>
          )}

          {filteredEpisodios.length > 0 && (
            <ul>
              {filteredEpisodios.map((ep, i) => (
                <li key={i}>
                  <strong>
                    {destacarTexto(ep.episodio_numero, query)} - {destacarTexto(ep.titulo_p, query)}
                  </strong>{' '}
                  ({destacarTexto(ep.titulo_j, query)})<br />
                  Página: {ep.pagina}
                  <br />
                  <em>{destacarTexto(ep.conteudo_p, query) || 'Sem conteúdo em português'}</em>
                  <br />
                  <em>{destacarTexto(ep.conteudo_j, query) || 'Sem conteúdo em japonês'}</em>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;
