import { useEffect, useState, useRef } from 'react';
import './App.css'
import { destacarTexto } from './utils';
import { useFetchData } from './hooks/useFetchData';
import { useSearch } from './hooks/useSearch';
import type { SearchOptions } from './types';

function App() {
  const {loading, data} = useFetchData();
  const [query, setQuery] = useState('');
  const [queryConfirmada, setQueryConfirmada] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
   termos: true, 
   episodios: false, 
   hinos:false, 
   ofudessaki:false, 
   ossashizu:false     
  })
  const [buscaFeita, setBuscaFeita] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);

  const resultados = useSearch(data, queryConfirmada, searchOptions);
  const {
    termos = [],
    episodios = [],
    hinos = [],
    ofudessaki = [],
    ossashizu = [],
    error
  } = resultados;



  const handleSearch = () => {
    if (!query.trim()) return;
    setQueryConfirmada(query);
    setBuscaFeita(true);
  };

  const handleOpitionsChange = (campo: keyof SearchOptions) => {
    setSearchOptions((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if(e.key === 'Enter') botaoRef.current?.click();
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  });

  return (
    <div className='dict-section'>
      <h1 style={{ fontSize: '3rem', textAlign: 'center' }}>Dicionário da Tenrikyo</h1>

      <div className='optionBusca' style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {(['termos', 'episodios', 'hinos', 'ofudessaki', 'ossashizu'] as (keyof SearchOptions)[]).map((op) => (
          <label key={op}>
            <input 
              type="checkbox" 
              checked={searchOptions[op]} 
              onChange={() => handleOpitionsChange(op)} 
            />
            {op.charAt(0).toUpperCase() + op.slice(1)}
            {op === 'ossashizu' && ' (incompleto)'}
        </label>
        ))}
      </div>
      <div className='container'>
<div className='input-wrapper' >
        <input
          type="text"
          value={query}
          id="input-buscar"
          placeholder="Digite para buscar..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <i className='fa fa-search' ref={botaoRef} onClick={handleSearch}></i>
      </div>
      </div>
      

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className='resultado-busca'>
          {error && <p className='error-select' style={{ color:'red' }}>{error}</p> }

          {!loading && buscaFeita && query.trim() && 
            termos.length === 0 && 
            episodios.length === 0 && 
            hinos.length === 0 && 
            ofudessaki.length === 0 && 
            ossashizu.length === 0 &&(
            <p className={error ? 'hidden' : 'loading-p'} >
              Termo não encontrado
            </p>
          )}
          {/* Resultados */}
          {termos.length > 0 && (
            <ul className='busca-termo'>
              {termos.map((termo, i) => (
                <li key={i} style={{marginBottom: '25px'}}>
                  <strong>
                    {destacarTexto(termo.romaji, query)}
                  </strong> 
                  ({destacarTexto(termo.kanji, query)}):<br />
                  {destacarTexto(termo.significado, query)}
                </li>
              ))}
            </ul>
          )}

          {episodios.length > 0 && (
            <ul className="busca-itsuwahen">
              {episodios.map((ep, i) => (
                <li key={i} style={{ marginBottom: '25px', borderBottom: '1px solid' }}>
                  <strong>
                    {destacarTexto(ep.episodio_numero.toString(), query)} - {destacarTexto(ep.titulo_p, query)}
                  </strong> ({destacarTexto(ep.titulo_j, query)})<br />
                  Página: {destacarTexto(ep.pagina, query)}<br />
                  <em>{destacarTexto(ep.conteudo_p, query) || 'Sem conteúdo em português'}</em><br /><br />
                  <em>{destacarTexto(ep.conteudo_j, query) || 'Sem conteúdo em japonês'}</em>
                </li>
              ))}
            </ul>
          )}

          {hinos.length > 0 && (
            <div className='busca-mikagurauta'>
              {hinos.map((hino, i) => (
                <div key={`hino-${i}`} style={{ marginBottom: '1rem', borderBottom: '1px solid'}}>
                  <h3 className='titulo-principal'>
                    {destacarTexto(hino.hino_romaji, query)} <br />
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

          {ofudessaki.length> 0 && (
            <ul className='busca-ofudessaki'>
              {ofudessaki.map((ofudessaki, i) => (
                <li key={`ofudessaki-${i}`} style={{marginBottom: '1rem', borderBottom: '1px solid'}}>
                  <strong>
                    Parte: {destacarTexto(ofudessaki.parte.toString(), query)} - Versículo ({destacarTexto(ofudessaki.versiculo.toString(), query)})
                  </strong>
                  <br />
                  <em>
                    {destacarTexto(ofudessaki.conteudo_j, query)} <br /><br />
                    {destacarTexto(ofudessaki.conteudo_r, query)} <br /><br />
                    {destacarTexto(ofudessaki.conteudo_p, query)}
                  </em>
                </li>
              ))}
            </ul>
          )}

          {ossashizu.length > 0 && (
            <div className='busca-ossashizu'>
              {ossashizu.map((os, i) => (
                <div key={`ossashizu-${i}`} style={{marginBottom: '1rem', borderBottom: '1px solid'}}>
                  <h3 className='titulo-principal'>
                    {destacarTexto(os.data_wareki, query)} <br />
                    {destacarTexto(os.data, query)}
                    {destacarTexto(' ('+os.data_lunar+') ', query)}
                    {destacarTexto(' (Ano '+os.ano_RD+' R.D.)', query)}
                  </h3>
                  <ul>
                    {os.paragrafos.map((paragrafos, j) => (
                      <li key={`paragrafo-${i}-${j}`} style={{marginBottom: '1rem'}}> 
                        <em>{destacarTexto(paragrafos.conteudo_port, query)}</em> <br /><br />
                        <em>{destacarTexto(paragrafos.conteudo_jap, query)}</em>
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
