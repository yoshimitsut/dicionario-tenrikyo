//useState: hook do React que permite criar e gerenciar estados dentro
//  de componentes funcionais.
//useEffect: hook que permite realizar efeitos colaterais 
// (ex.: chamadas de API) durante o ciclo de vida do componente.
import { useEffect, useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
// Define o tipo Termo para representar cada termo do glossário.
// Cada termo tem 3 propriedades:
// romaji → representação fonética,
// kanji → escrita japonesa,
// significado → tradução ou explicação.
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

function tirarAcentos (texto: string) {
  if(!texto) return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function destacarTexto(texto:string | null | undefined, termo: string ) {
  if(!texto) return null;
  if(!termo) return texto;

  const textoSemAcento = tirarAcentos(texto);
  const termoSemAcento = tirarAcentos(termo);
  
  const partes = [];
  let i = 0;

  while (i < texto.length) {
    const index = textoSemAcento.indexOf(termoSemAcento, i);

    if (index === -1) {
      partes.push(texto.slice(i));
      break;
    }

    partes.push(texto.slice(i, index));

    partes.push(
      <mark key={index} style={{backgroundColor:'yellow', color: 'black'}}>
        {texto.slice(index, index + termo.length)}
      </mark>
    );

    i = index + termo.length;
  }

  return <>{partes}</>
}

function App() {
//   termos: armazena todos os termos carregados do JSON.
//   setTermos: função para atualizar o estado.
  const [termos, setTermos] = useState<Termo[]>([]);
  const [episodios, setEpisodios] = useState<Episodio[]>([])

// query: armazena o texto digitado pelo usuário na busca.
  const [query, setQuery] = useState('');

//filtered: armazena a lista filtrada de termos com base na query.
  const [filteredTermos, setFilteredTermos] = useState<Termo[]>([]);
  const [filteredEpisodios, setFilteredEpisodios] = useState<Episodio[]>([]);

  const [loading, setLoading] = useState(true);
  const [digitou, setDigitou] = useState(false);
  
  const [buscarTermos, setBuscarTermos] = useState(true);
  const [buscarEpisodios, setBuscarEpisodios] = useState(false);

// Carrega JSON ao iniciar
// useEffect: executa a função ao montar o componente.
  useEffect(() => {
    const fetchJSON = async () => {
      try {
        // fetch('/works.json'): busca o arquivo JSON no servidor.
        const termosResponse = await fetch('/data/works.json');
        const episodiosResponse = await fetch('/data/itsuwahen.json');
        
         if (!termosResponse.ok || !episodiosResponse.ok) {
          throw new Error(`Erro ao carregar arquivos JSON`);
        }

        // await response.json(): converte a resposta para um objeto JavaScript(JSON)
        const termosData: Termo[] = await termosResponse.json();
        const episodiosData: Episodio[] = await episodiosResponse.json();
        
        //Armazena os termos no estado.
        //Inicialmente, a lista filtrada á igual à completa
        setTermos(termosData);
        setFilteredTermos(termosData);

        setEpisodios(episodiosData);
        setFilteredEpisodios(episodiosData);
      }catch(error){
        console.error('Erro ao carregar JSON:', error);
      }finally {
        setLoading(false);
      }
    };
    
    //Chama a função de carregar JSON.
    fetchJSON();
  }, []);

  // função que filtra os termos conforme a query.
  const filtrar = useCallback(() => {
    const normalizedQuery = tirarAcentos(query)
    
    if (!digitou || !query) {
      // setFilteredTermos([]);
      setFilteredEpisodios([]);
      return;
    }
    //const lowerQuery = query.toLowerCase();
    // toLowerCase(): deixa tudo minúsculo para uma busca case-insensitive.
    if (buscarTermos) {
      const filtered = termos.filter(
        (termo) => 
          tirarAcentos(termo.romaji).includes(normalizedQuery) ||
          termo.kanji.includes(query) ||
          tirarAcentos(termo.significado).includes(normalizedQuery)
      );
      setFilteredTermos(filtered);
    } else {
      setFilteredTermos([]);
    }

    if (buscarEpisodios) {
      const filtered = episodios.filter(
        (episodio) => 
          tirarAcentos(episodio.titulo_p).includes(normalizedQuery) ||
          episodio.titulo_j.includes(query) ||
          (episodio.conteudo_p && tirarAcentos(episodio.conteudo_p).includes(normalizedQuery)) ||
          (episodio.conteudo_j && episodio.conteudo_j.includes(query))
      );
      setFilteredEpisodios(filtered);
    } else {
      setFilteredEpisodios([]);
    }

    // const filteredTermos = termos.filter(
    //   (termo) =>
    //     // includes(lowerQuery): verifica se há correspondência parcial no texto.
    //     tirarAcentos(termo.romaji).includes(normalizedQuery) ||
    //     termo.kanji.includes(query) ||
    //     tirarAcentos(termo.significado).includes(normalizedQuery)
    // );
    // // Atualiza filtered com os resultados encontrados.
    // setFilteredTermos(filteredTermos);

    // const filteredEpisodios = episodios.filter(
    //   (episodio) => 
    //     tirarAcentos(episodio.titulo_p).includes(normalizedQuery) ||
    //     episodio.titulo_j ||
    //     (episodio.conteudo_p && 
    //       tirarAcentos(episodio.conteudo_p).includes(normalizedQuery)) || 
    //     episodio.conteudo_j   
    // );
    // setFilteredEpisodios(filteredEpisodios);
  }, [query, termos, episodios, buscarTermos, buscarEpisodios]);

  // Sempre que query ou termos mudar, executa filtrar() automaticamente.
  // Assim, a lista filtrada é sempre atualizada conforme o usuário digita.
  const debouncedFiltrar = useCallback(debounce(filtrar, 300), [filtrar]);

  useEffect(() => {
    debouncedFiltrar();
    return debouncedFiltrar.cancel;
  }, [debouncedFiltrar, query]);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth:'890px' }}>
      <h1 style={{ 
          fontSize: '3rem', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          top: 0, 
          textAlign: 'center'
          }}>
        Dicionário da Tenrikyo
      </h1>

        <div style={{ display: 'flex', alignItems:'center', justifyContent: 'center', gap: '1rem'}}>
          <label>
            <input type="checkbox" 
              checked={buscarTermos}
              onChange={(e) => setBuscarTermos(e.target.checked)}
            /> {' '}
              Buscar Termo.
          </label>

          <label>
            <input
              type="checkbox" 
              checked={buscarEpisodios}
              onChange={(e) => setBuscarEpisodios(e.target.checked)}
              /> {' '}
              Episódios da Vida de Oyassama.
          </label>
        </div>

      <div style={{ 
          marginBottom: '1rem',
          position: 'sticky', /* Use 'sticky' para melhor comportamento de rolagem */
          top: 0,            /* Fixa no topo */
          padding: '1rem 0', /* Espaçamento interno */
          zIndex: 1000,      /* Garante que fique acima de outros elementos */
          backgroundColor: '#242426',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
      }}>
        {/* Campo de texto controlado → valor sempre é query.
            onChange: atualiza query conforme o usuário digita. */}
        <input
          type="text"
          placeholder="Digite para buscar..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setDigitou(e.target.value.length > 0);
          }}
          style={{ padding: '0.5rem', width: '20rem', marginLeft: '0.5rem' }}
        />

        <button onClick={filtrar} style={{ padding: '0.5rem 1rem' }}>
          Pesquisar
        </button>
        {/* Botão que permite executar manual a busca, além da automática.
        Ao clicar, chama filtrar(). */}
      </div>
      
      {loading ? (
        <p>Carregando...</p>
      ):(
        <>
          {buscarTermos && (
            <ul>
              {/* Percorre cada termo da lista filtered.
                  Mostra romaji, kanji e significado.
                  key={index}: ajuda o React a identificar cada item 
                  (ideal seria usar ID, mas não temos). */}
              {filteredTermos.map((termo, index) => (
                <li key={index} style={{ marginBottom: '1rem' }}>
                  <strong>{destacarTexto(termo.romaji, query)}</strong> 
                  {' '}({destacarTexto(termo.kanji, query)}):<br />
                  {destacarTexto(termo.significado, query)}
                </li>
              ))}
            </ul>
          )}
      
          {buscarEpisodios && digitou && (
          <ul>
            {filteredEpisodios.map((episodio, index) => (
              <li key={index} style={{marginBottom: '1rem'}}>
                <strong>
                  {destacarTexto(String(episodio.episodio_numero), query)} 
                  - {destacarTexto(episodio.titulo_p, query)}
                </strong>
                <strong> 
                  {destacarTexto(episodio.titulo_j, query)}
                </strong>

                {' '} (Página {destacarTexto(String(episodio.pagina), query)}): <br />
                <em>{destacarTexto(episodio.conteudo_p, query) || 'Sem conteúdo em português'}</em>
                <br />
                <em>{destacarTexto(episodio.conteudo_j, query) || 'Sem conteúdo em japonês'}</em>
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