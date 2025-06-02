//useState: hook do React que permite criar e gerenciar estados dentro
//  de componentes funcionais.
//useEffect: hook que permite realizar efeitos colaterais 
// (ex.: chamadas de API) durante o ciclo de vida do componente.
import { useEffect, useState, useCallback } from 'react';

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
  episodio_numero: string | number;
  titulo_p: string;
  titulo_j: string;
  pagina: string | number;
  conteudo_p: string | null;
  conteudo_j: string | null;
}

function tirarAcentos (texto: string) {
  if(!texto) return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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

  //const lowerQuery = query.toLowerCase();
  // toLowerCase(): deixa tudo minúsculo para uma busca case-insensitive.
    
    const filteredTermos = termos.filter(
      (termo) =>
        // includes(lowerQuery): verifica se há correspondência parcial no texto.
        tirarAcentos(termo.romaji).includes(normalizedQuery) ||
        termo.kanji.includes(query) ||
        tirarAcentos(termo.significado).includes(normalizedQuery)
    );
    // Atualiza filtered com os resultados encontrados.
    setFilteredTermos(filteredTermos);

    const filteredEpisodios = episodios.filter(
      (episodio) => 
        tirarAcentos(episodio.titulo_p).includes(normalizedQuery) ||
        episodio.titulo_j ||
        (episodio.conteudo_p && 
          tirarAcentos(episodio.conteudo_p).includes(normalizedQuery)) || 
        episodio.conteudo_j   
    );
    setFilteredEpisodios(filteredEpisodios);
  }, [query, termos, episodios]);

  // Sempre que query ou termos mudar, executa filtrar() automaticamente.
  // Assim, a lista filtrada é sempre atualizada conforme o usuário digita.
  useEffect(() => {
    filtrar();
  }, [filtrar]);

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
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '0.5rem', width: '20rem', marginRight: '0.5rem' }}
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
      <ul>
        {/* Percorre cada termo da lista filtered.
            Mostra romaji, kanji e significado.
            key={index}: ajuda o React a identificar cada item 
            (ideal seria usar ID, mas não temos). */}
        {filteredTermos.map((termo, index) => (
          <li key={index} style={{ marginBottom: '1rem' }}>
            <strong>{termo.romaji}</strong> ({termo.kanji}):<br />
            {termo.significado}
          </li>
        ))}
      </ul>
      )}

      {loading ? (
        <p>Carregando...</p>
      ):(
        <ul>
          {filteredEpisodios.map((episodio, index) => (
            <li key={index} style={{marginBottom: '1rem'}}>
              <strong>{episodio.episodio_numero} {episodio.titulo_p}</strong>
              <strong> {episodio.titulo_j}</strong>
              (Página {episodio.pagina}): <br />
              <em>{episodio.conteudo_p || 'Sem conteúdo em português'}</em>
              <br />
              <em>{episodio.conteudo_j || 'Sem conteúdo em japonês'}</em>

            </li>
          ))}
        </ul>
      )}


    </div>
  );
}

export default App;