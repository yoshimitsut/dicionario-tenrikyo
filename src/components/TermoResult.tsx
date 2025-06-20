import type { Termo } from '../types';
import { destacarTexto } from '../utils';

export function TermoResult({ termos, query }: { termos: Termo[]; query: string }) {
  return (
    <ul className='busca-termo'>
      {termos.map((t, i) => (
        <li key={i}>
          <strong>{destacarTexto(t.romaji, query)}</strong> ({destacarTexto(t.kanji, query)}): <br />
          {destacarTexto(t.significado, query)}
        </li>
      ))}
    </ul>
  );
}
