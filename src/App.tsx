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

interface Ofudessaki {
  parte: string,
  versiculo: string,
  conteudo_j: string,
  conteudo_r: string,
  conteudo_p: string
}

interface Ossashizu {
  data_wareki: string,
  data: string,
  data_lunar: string,
  ano_RD: string,
  paragrafos: Paragrafos[]
}

interface Paragrafos {
  conteudo_jap: string,
  conteudo_port: string
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
  const [ofudessaki, setOfudessaki] = useState<Ofudessaki[]>([]);
  const [ossashizu, setOssashizu] = useState<Ossashizu[]>([])

  const [filteredTermos, setFilteredTermos] = useState<Termo[]>([]);
  const [filteredEpisodios, setFilteredEpisodios] = useState<Episodio[]>([]);
  const [filteredHinos, setFilteredHinos] = useState<Hino[]>([]);
  const [filteredOfudessaki, setFilteredOfudessaki] = useState<Ofudessaki[]>([]);
  const [filteredOssashizu, setFilteredOssashizu] = useState<Ossashizu[]>([]);
  
  const [buscarTermos, setBuscarTermos] = useState(true);
  const [buscarEpisodios, setBuscarEpisodios] = useState(false);
  const [buscarHinos, setBuscarHinos] = useState(false);
  const [buscarOfudessaki, setBuscarOfudessaki] = useState(false);
  const [buscarOssashizu, setBuscarOssashizu] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);
  
  const [query, setQuery] = useState('');

  const botaoRef = useRef<HTMLButtonElement>(null);

  // Carrega os dados JSON apenas uma vez, sem filtrar nada
  useEffect(() => {
    const fetchJSON = async () => {
      try {
        setLoading(true);
        const termosResponse = await fetch('/data/works.json');
        const episodiosResponse = await fetch('/data/itsuwahen.json');
        const hinosResponse = await fetch('/data/mikagurauta.json');
        const ofudessakiResponse = await fetch('data/ofudessaki.json');
        const ossashizuResponse = await fetch('data/ossashizu.json');

        if (!termosResponse.ok || !episodiosResponse.ok || !hinosResponse.ok || !ofudessakiResponse.ok || !ossashizuResponse.ok) {
          throw new Error('Erro ao carregar JSON');
        }

        const termosData: Termo[] = await termosResponse.json();
        const episodiosData: Episodio[] = await episodiosResponse.json();
        const hinosData: Hino[] = await hinosResponse.json();
        const ofudessakiData: Ofudessaki[] = await ofudessakiResponse.json();
        const ossashizuData: Ossashizu[] = await ossashizuResponse.json();

        setTermos(termosData);
        setEpisodios(episodiosData);
        setHinos(hinosData);
        setOfudessaki(ofudessakiData);
        setOssashizu(ossashizuData);

        // NÃO mostrar resultados automaticamente:
        setFilteredTermos([]);
        setFilteredEpisodios([]);
        setFilteredHinos([]);
        setFilteredOfudessaki([]);
        setFilteredOssashizu([]);

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
      setFilteredHinos([]);
      setFilteredOfudessaki([]);
      setFilteredOssashizu([]);
      return;
    }

    if (!buscarTermos && !buscarEpisodios && !buscarHinos && !buscarOfudessaki && !buscarOssashizu){
      alert('Selecione uma opção de busca.');
      return;
    }

    if(!normalizado){
      setFilteredTermos([]);
      setFilteredEpisodios([]);
      setFilteredHinos([]);
      setFilteredOfudessaki([]);
      setFilteredOssashizu([]);
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
          e.episodio_numero?.toString().toLowerCase().includes(normalizado) ||
          //e.pagina?.toString().toLowerCase().includes(normalizado) ||
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

    if(buscarOfudessaki){
      const filtrados = ofudessaki.filter(
        (of) => 
          of.parte?.toString().toLowerCase().includes(normalizado) ||
          of.versiculo?.toString().toLowerCase().includes(normalizado) ||
          (of.conteudo_j && of.conteudo_j.includes(normalizado))||
          (of.conteudo_r && of.conteudo_r.toLowerCase().includes(normalizado)) ||
          tirarAcentos(of.conteudo_p).toLowerCase().includes(normalizado)         
      )
      setFilteredOfudessaki(filtrados);
    } else {
      setFilteredOfudessaki([]);
    }

    if(buscarOssashizu){
      const filtrados = ossashizu.map((ossashizu) => {
        const dataWareki = tirarAcentos(ossashizu.data_wareki ?? '').toLowerCase();
        const data = tirarAcentos(ossashizu.data ?? '').toLowerCase();
        const dataLunar  = tirarAcentos(ossashizu.data_lunar ?? '').toLowerCase();
        const anoRD = tirarAcentos(ossashizu.ano_RD ?? '').toLowerCase(); 
        
        const combinaData = 
          dataWareki.includes(normalizado) || data.includes(normalizado)||
          dataLunar.includes(normalizado) || anoRD.includes(normalizado)
        
        if(combinaData) {
          return ossashizu;
        }

        const paragrafosFiltrados = Array.isArray(ossashizu.paragrafos) ?
          ossashizu.paragrafos.filter(
          (t) => 
            tirarAcentos(t.conteudo_port).includes(normalizado) ||
            t.conteudo_jap && tirarAcentos(t.conteudo_jap).includes(query)
        )
        :[];

        return paragrafosFiltrados.length > 0 ? {...ossashizu, paragrafos: paragrafosFiltrados} : null;
      })
      .filter(Boolean) as Ossashizu[];
      setFilteredOssashizu(filtrados);
    }else{
      setFilteredOssashizu([]);
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
    <div className='dict-section' >
      <h1 style={{ fontSize: '3rem', textAlign: 'center' }}>Dicionário da Tenrikyo</h1>

      <div className='optionBusca' style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <label>
          <input type="checkbox" checked={buscarTermos} onChange={(e) => setBuscarTermos(e.target.checked)} />
          Termos
        </label>
        <label >
          <input type="checkbox" checked={buscarEpisodios} onChange={(e) => setBuscarEpisodios(e.target.checked)} />
          Itsuwahen
        </label>
        <label>
          <input type="checkbox" checked={buscarHinos} onChange={(e) => setBuscarHinos(e.target.checked)} />
          Mikagura-Uta
        </label>
        <label>
          <input type="checkbox" checked={buscarOfudessaki} onChange={(e) => setBuscarOfudessaki(e.target.checked)} />
          Ofudessaki
        </label>
        <label>
          <input type="checkbox" checked={buscarOssashizu} onChange={(e) => setBuscarOssashizu(e.target.checked)}/>
          Ossashizu
        </label>
      </div>

      <div className='input-wrapper' >
        <input
          type="text"
          id="input-buscar"
          name="input-buscar"
          value={query}
          placeholder="Digite para buscar..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <i className='fa fa-search' ref={botaoRef} onClick={filtrar} >
          
        </i>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className='resultado-busca'>
          {!loading && buscaFeita && query.trim() && filteredTermos.length === 0 && filteredEpisodios.length === 0 && filteredHinos.length === 0 && filteredOfudessaki.length === 0 && filteredOssashizu.length === 0 &&(
            <p className='loading-p' >
              Termo não encontrado
            </p>
          )}
          
          {filteredTermos.length > 0 && (
            <ul className='busca-termo'>
              {filteredTermos.map((termo, i) => (
                <li key={i} style={{marginBottom: '25px'}}>
                  <strong>{destacarTexto(termo.romaji, query)}</strong> ({destacarTexto(termo.kanji, query)}):<br />
                  {destacarTexto(termo.significado, query)}
                </li>
              ))}
            </ul>
          )}

          {filteredEpisodios.length > 0 && (
            <ul className='busca-itsuwahen'>
              {filteredEpisodios.map((ep, i) => (
                <li key={i} style={{marginBottom: '25px', borderBottom: '1px solid'}}>
                  <strong>
                    {destacarTexto(ep.episodio_numero.toString(), query)} - {destacarTexto(ep.titulo_p, query)}
                  </strong>{' '}
                  ({destacarTexto(ep.titulo_j, query)})<br />
                  Página: {destacarTexto(ep.pagina, query)}
                  <br />
                  <em>{destacarTexto(ep.conteudo_p, query) || 'Sem conteúdo em português'}</em>
                  <br />
                  <em>{destacarTexto(ep.conteudo_j, query) || 'Sem conteúdo em japonês'}</em>
                </li>
              ))}
            </ul>
          )}

          {filteredHinos.length > 0 && (
            <div className='busca-mikagurauta'>
              {filteredHinos.map((hino, i) => (
                <div key={`hino-${i}`} style={{ marginBottom: '1rem', borderBottom: '1px solid'}}>
                  <h3 className='titulo-principal'>
                    {destacarTexto(hino.hino_romaji, query)} 
                    {destacarTexto(hino.hino_kanji, query)}
                  </h3>
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

          {filteredOfudessaki.length> 0 && (
            <ul className='busca-ofudessaki'>
              {filteredOfudessaki.map((ofudessaki, i) => (
                <li key={`ofudessaki-${i}`} style={{marginBottom: '1rem', borderBottom: '1px solid'}}>
                  <strong>
                    Parte: {destacarTexto(ofudessaki.parte.toString(), query)} - Versículo ({destacarTexto(ofudessaki.versiculo.toString(), query)})
                  </strong>
                  <br />
                  <em>
                    {destacarTexto(ofudessaki.conteudo_j, query)} <br />
                    {destacarTexto(ofudessaki.conteudo_r, query)} <br />
                    {destacarTexto(ofudessaki.conteudo_p, query)}
                  </em>
                </li>
              ))}
            </ul>
          )}

          {filteredOssashizu.length > 0 && (
            <div className='busca-ossashizu'>
              {filteredOssashizu.map((ossashizu, i) => (
                <div key={`ossashizu-${i}`} style={{marginBottom: '1rem', borderBottom: '1px solid'}}>
                  <h3 className='titulo-principal'>
                    {destacarTexto(ossashizu.data_wareki, query)} <br />
                    {destacarTexto(ossashizu.data_lunar, query)}
                  </h3>
                  <ul>
                    {Array.isArray(ossashizu.paragrafos) && ossashizu.paragrafos.map((paragrafos, j) => (
                      <li key={`paragrafo-${i}-${j}`} style={{marginBottom: '1rem'}}> 
                        <em>{destacarTexto(paragrafos.conteudo_port ?? '', query)}</em> <br />
                        <em>{destacarTexto(paragrafos.conteudo_jap ?? '', query)}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
