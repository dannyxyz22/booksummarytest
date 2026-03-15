const fs = require('fs');
const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1100' viewBox='0 0 800 1100'>
  <rect width='800' height='1100' fill='#1a3d2b'/>
  <rect x='20' y='20' width='760' height='1060' fill='none' stroke='#d4af37' stroke-width='8'/>
  <rect x='35' y='35' width='730' height='1030' fill='none' stroke='#d4af37' stroke-width='1.5' stroke-dasharray='4,4'/>
  <text x='45' y='72' font-size='38' fill='#d4af37' font-family='serif'>&#10022;</text>
  <text x='705' y='72' font-size='38' fill='#d4af37' font-family='serif'>&#10022;</text>
  <text x='45' y='1082' font-size='38' fill='#d4af37' font-family='serif'>&#10022;</text>
  <text x='705' y='1082' font-size='38' fill='#d4af37' font-family='serif'>&#10022;</text>
  <text x='400' y='230' font-size='100' fill='#d4af37' font-family='serif' text-anchor='middle'>&#10047;</text>
  <line x1='100' y1='290' x2='700' y2='290' stroke='#d4af37' stroke-width='1'/>
  <line x1='80' y1='297' x2='720' y2='297' stroke='#d4af37' stroke-width='0.5'/>
  <text x='400' y='370' font-size='38' fill='#d4af37' font-family='Georgia, Times, serif' text-anchor='middle' font-weight='bold'>A Vida e as Glorias</text>
  <text x='400' y='420' font-size='38' fill='#d4af37' font-family='Georgia, Times, serif' text-anchor='middle' font-weight='bold'>de Sao Jose</text>
  <line x1='80' y1='445' x2='720' y2='445' stroke='#d4af37' stroke-width='0.5'/>
  <line x1='100' y1='452' x2='700' y2='452' stroke='#d4af37' stroke-width='1'/>
  <text x='400' y='530' font-size='22' fill='#c9a227' font-family='Georgia, Times, serif' text-anchor='middle' font-style='italic'>Edward Healy Thompson</text>
  <text x='400' y='980' font-size='16' fill='#8aabbf' font-family='Georgia, serif' text-anchor='middle' letter-spacing='3'>SUMMA BREVIS</text>
  <text x='400' y='1040' font-size='28' fill='#d4af37' font-family='serif' text-anchor='middle'>&#10022;  &#10022;  &#10022;</text>
</svg>`;
fs.writeFileSync('c:/Users/danny/code/agent-book-summarizer/webapp/public/assets/covers/life-glories-joseph.svg', svg);
console.log('SVG cover saved.');
