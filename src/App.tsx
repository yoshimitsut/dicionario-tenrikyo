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

function App() {
//   termos: armazena todos os termos carregados do JSON.
//   setTermos: função para atualizar o estado.
  const [termos, setTermos] = useState<Termo[]>([]);

// query: armazena o texto digitado pelo usuário na busca.
  const [query, setQuery] = useState('');

//filtered: armazena a lista filtrada de termos com base na query.
  const [filtered, setFiltered] = useState<Termo[]>([]);

  const [loading, setLoading] = useState(true);
// Carrega JSON ao iniciar
// useEffect: executa a função ao montar o componente.
  useEffect(() => {
    const fetchJSON = async () => {
      try {
        // fetch('/works.json'): busca o arquivo JSON no servidor.
        const response = await fetch('/data/works.json');
        
         if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        // await response.json(): converte a resposta para um objeto JavaScript(JSON)
        const data: Termo[] = await response.json();
        
        //Armazena os termos no estado.
        //Inicialmente, a lista filtrada á igual à completa
        setTermos(data);
        setFiltered(data);
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
  const lowerQuery = query.toLowerCase();
  // toLowerCase(): deixa tudo minúsculo para uma busca case-insensitive.
    
  const filteredResults = termos.filter(
    (termo) =>
      // includes(lowerQuery): verifica se há correspondência parcial no texto.
      termo.romaji.toLowerCase().includes(lowerQuery) ||
      termo.kanji.includes(query) ||
      termo.significado.toLowerCase().includes(lowerQuery)
    );
    // Atualiza filtered com os resultados encontrados.
    setFiltered(filteredResults);
  }, [query, termos]);

  // Sempre que query ou termos mudar, executa filtrar() automaticamente.
  // Assim, a lista filtrada é sempre atualizada conforme o usuário digita.
  useEffect(() => {
    filtrar();
  }, [filtrar]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ 
                fontSize: '3rem', 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                top: 0, 
                }}>
        Dicionário da Tenrikyo (pt-br)
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
          style={{ padding: '0.5rem', width: '300px', marginRight: '0.5rem' }}
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
        {filtered.map((termo, index) => (
          <li key={index} style={{ marginBottom: '1rem' }}>
            <strong>{termo.romaji}</strong> ({termo.kanji}):<br />
            {termo.significado}
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

export default App;
