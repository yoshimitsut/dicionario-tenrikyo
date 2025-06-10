import { useEffect, useState, useRef } from 'react';
import './App.css'
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
interface Verso {
  verso_numero: string;
  romaji: string | null;
  kanji: string | null;
  traducao: string | null;
}
interface Hino {
  hino_romaji: string;
  hino_kanji: string;
  versos: Verso[];  
}


function tirarAcentos(texto: string | null | undefined): string {
  if (typeof texto !== 'string') return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function destacarTexto(texto: string | null | undefined, termo: string): React.ReactNode {
  if (typeof texto !== 'string' || !termo) return texto ?? null;

  const termoSemAcento = tirarAcentos(termo);
  const textoSemAcento = tirarAcentos(texto);

  const regex = new RegExp(termoSemAcento.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const partes: React.ReactNode[] = [];

  let lastIndex = 0;
  let indexKey = 0;

  while ((regex.exec(textoSemAcento)) !== null) {

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
  const [hinos, setHinos] = useState<Hino[]>([]);

  const [query, setQuery] = useState('');
  const [filteredTermos, setFilteredTermos] = useState<Termo[]>([]);
  const [filteredEpisodios, setFilteredEpisodios] = useState<Episodio[]>([]);
  const [filteredHinos, setFilteredHinos] = useState<Hino[]>([]);

  const [buscarTermos, setBuscarTermos] = useState(true);
  const [buscarEpisodios, setBuscarEpisodios] = useState(false);
  const [buscarHinos, setBuscarHinos] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);

  const botaoRef = useRef<HTMLButtonElement>(null);

  // Carrega os dados JSON apenas uma vez, sem filtrar nada
  useEffect(() => {
    const fetchJSON = async () => {
      try {
        setLoading(true);
        const termosResponse = await fetch('/data/works.json');
        const episodiosResponse = await fetch('/data/itsuwahen.json');
        const hinosResponse = await fetch('/data/mikagurauta.json');

        if (!termosResponse.ok || !episodiosResponse.ok || !hinosResponse.ok) {
          throw new Error('Erro ao carregar JSON');
        }

        const termosData: Termo[] = await termosResponse.json();
        const episodiosData: Episodio[] = await episodiosResponse.json();
        const hinosData: Hino[] = await hinosResponse.json();

        setTermos(termosData);
        setEpisodios(episodiosData);
        setHinos(hinosData);

        // NÃO mostrar resultados automaticamente:
        setFilteredTermos([]);
        setFilteredEpisodios([]);
        setFilteredHinos([]);

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

    if (!buscarTermos && !buscarEpisodios && !buscarHinos){
      alert('Selecione uma opção de busca.');
      return;
    }

    if(!normalizado){
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

    if(buscarHinos){
      const filtrados = hinos.map((hino) => {
        const hinoRomaji = tirarAcentos(hino.hino_romaji ?? '').toLowerCase();
    const hinoKanji = tirarAcentos(hino.hino_kanji ?? '').toLowerCase();

    const nomeCombina =
      hinoRomaji.includes(normalizado) || hinoKanji.includes(normalizado);

    if (nomeCombina) {
      return hino; // Mostra o hino inteiro
    }
        
        const versosFiltrados = hino.versos.filter(
          (v) => 
            tirarAcentos(v.romaji).includes(normalizado) ||
            v.kanji && tirarAcentos(v.kanji).includes(query) ||
            tirarAcentos(v.traducao).includes(normalizado)
        )
        return versosFiltrados.length > 0 ? {...hino, versos: versosFiltrados} : null;
      })
      .filter(Boolean) as Hino[];

      setFilteredHinos(filtrados);
    } else {
      setFilteredHinos([]);
    }

    setBuscaFeita(true);
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
        <label>
          <input type="checkbox" checked={buscarHinos} onChange={(e) => setBuscarHinos(e.target.checked)} />
          Mikagura-Uta
        </label>
      </div>

      <div className='input-wrapper' style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <input
          type="text"
          value={query}
          placeholder="Digite para buscar..."
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '0.5rem', width: '20rem' }}
        />
        <i className='fa fa-search' ref={botaoRef} onClick={filtrar} style={{ padding: '0.5rem 1rem' }}>
          
        </i>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          {!loading && buscaFeita && query.trim() && filteredTermos.length === 0 && filteredEpisodios.length === 0 && filteredHinos.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'gray' }}>
              Termo não encontrado
            </p>
          )}

          {filteredTermos.length > 0 && (
            <ul>
              {filteredTermos.map((termo, i) => (
                <li key={i} style={{marginBottom: '25px'}}>
                  <strong>{destacarTexto(termo.romaji, query)}</strong> ({destacarTexto(termo.kanji, query)}):<br />
                  {destacarTexto(termo.significado, query)}
                </li>
              ))}
            </ul>
          )}

          {filteredEpisodios.length > 0 && (
            <ul>
              {filteredEpisodios.map((ep, i) => (
                <li key={i} style={{marginBottom: '25px', borderBottom: '1px solid'}}>
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

          {filteredHinos.length > 0 && (
            <div>
              {filteredHinos.map((hino, i) => (
                <div key={`hino-${i}`} style={{ marginBottom: '1rem', borderBottom: '1px solid'}}>
                  <h3>{destacarTexto(hino.hino_romaji, query)} ({destacarTexto(hino.hino_kanji, query)})</h3>
                    <ul>
                      {hino.versos.map((verso, j) => (
                        <li key={`verso-${i}-${j}`} style={{ marginBottom: '1rem'}}>
                          <strong>{destacarTexto(verso.romaji, query)}</strong><br />
                          <em>{destacarTexto(verso.kanji, query)}</em> <br />
                          {destacarTexto(verso.traducao, query)}
                        </li>
                      ))}
                    </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
