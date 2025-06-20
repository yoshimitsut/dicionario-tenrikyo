
export function tirarAcentos(texto: string | null | undefined): string{
  return typeof texto === 'string'
  ?texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  : '';
}

export function destacarTexto(texto: string | null | undefined, palavra: string): React.ReactNode {
  if (typeof texto !== 'string' || !palavra) return texto ?? null;

  const normPalavra = tirarAcentos(palavra);
  const normTexto = tirarAcentos(texto);
  const regex = new RegExp(normPalavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

  const partes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(normTexto)) !== null) {
    const realStart = match.index;

    // Adiciona o texto antes da palavra destacada
    partes.push(<span key={`texto-${keyIndex++}`}>{texto.slice(lastIndex, realStart)}</span>);

    // Adiciona o trecho destacado
    partes.push(
      <mark key={`mark-${keyIndex++}`} style={{ background: 'yellow', color: 'black' }}>
        {texto.slice(realStart, realStart + palavra.length)}
      </mark>
    );

    lastIndex = realStart + palavra.length;
  }

  // Adiciona o restante do texto após a última ocorrência
  partes.push(<span key={`final-${keyIndex}`}>{texto.slice(lastIndex)}</span>);

  return <>{partes}</>;
}
