//useState: hook do React que permite criar e gerenciar estados dentro
//  de componentes funcionais.
//useEffect: hook que permite realizar efeitos colaterais 
// (ex.: chamadas de API) durante o ciclo de vida do componente.
import { useEffect, useState, useCallback } from 'react';

//Define o tipo Termo para representar cada termo do glossário.
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
//   termos: armazena todos os termos carregados do XML.
//   setTermos: função para atualizar o estado.
  const [termos, setTermos] = useState<Termo[]>([]);

// query: armazena o texto digitado pelo usuário na busca.
  const [query, setQuery] = useState('');

//filtered: armazena a lista filtrada de termos com base na query.
  const [filtered, setFiltered] = useState<Termo[]>([]);

// Carrega XML ao iniciar
// useEffect: executa a função ao montar o componente.
  useEffect(() => {
    const fetchXML = async () => {
      try {
        // fetch('/works.xml'): busca o arquivo XML no servidor.
        const response = await fetch('/works.xml');

        // await response.text(): converte a resposta para texto.
        const text = await response.text();

        // new DOMParser().parseFromString: transforma o texto em um documento XML.
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');

        // xml.getElementsByTagName('termo'): pega todos os elementos <termo> do XML
        // Array.from(...).map(...): transforma cada <termo> em um objeto Termo.
        const termosArray: Termo[] = Array.from(xml.getElementsByTagName('termo')).map((termo) => ({
          romaji: termo.getElementsByTagName('romaji')[0]?.textContent || '',
          kanji: termo.getElementsByTagName('kanji')[0]?.textContent || '',
          significado: termo.getElementsByTagName('significado')[0]?.textContent || '',
        // ?.textContent || '': garante que, se não existir o elemento, não dará erro — apenas ficará uma string vazia.
        }));

//      Armazena os termos no estado.
//      Inicialmente, a lista filtrada é igual à completa.
        setTermos(termosArray);
        setFiltered(termosArray);
      } catch (error) {
        //Captura e exibe qualquer erro que ocorrer no carregamento do XML.
        console.error('Erro ao carregar XML:', error);
      }
    };
    
    //Chama a função de carregar XML.
    fetchXML();
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
      <h1>Dicionário da Tenrikyo (pt-br)</h1>

      <div style={{ marginBottom: '1rem' }}>
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
    </div>
  );
}

export default App;
