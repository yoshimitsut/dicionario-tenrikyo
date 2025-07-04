
export function tirarAcentos(texto: string | null | undefined): string{
  return typeof texto === 'string'
  ?texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  : '';
}

export function destacarTexto(texto: string | null | undefined, palavra: string): React.ReactNode {
  if (typeof texto !== 'string' || !palavra) return texto ?? null;

  const textoSeguro = texto; 
  const normTexto = tirarAcentos(textoSeguro);
  const normPalavra = tirarAcentos(palavra);

  const regex = new RegExp(normPalavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

  const partes: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;
  let match;

  function mapIndex(normalIndex: number): number {
    let count = 0;
    for (let i = 0; i < textoSeguro.length; i++) {
      const c = tirarAcentos(textoSeguro[i]);
      if (count === normalIndex) return i;
      count += c.length;
    }
    return textoSeguro.length;
  }

  while ((match = regex.exec(normTexto)) !== null) {
    const normStart = match.index;
    const normEnd = normStart + match[0].length;

    const realStart = mapIndex(normStart);
    const realEnd = mapIndex(normEnd);

    partes.push(<span key={`texto-${keyIndex++}`}>{textoSeguro.slice(lastIndex, realStart)}</span>);
    partes.push(
      <mark key={`mark-${keyIndex++}`} style={{ background: 'yellow', color: 'black' }}>
        {textoSeguro.slice(realStart, realEnd)}
      </mark>
    );

    lastIndex = realEnd;
  }

  partes.push(<span key={`final-${keyIndex}`}>{textoSeguro.slice(lastIndex)}</span>);

  return <>{partes}</>;
}



