const wordsByCategory = {
  "Países": ["MEXICO", "CANADA", "ARGENTINA", "CHILE", "JAPON", "ITALIA", "EGIPTO", "CHINA", "RUSIA", "ESPAÑA"],
  "Frutas": ["MANZANA", "PERA", "KIWI", "FRESA", "MANGO", "PLATANO", "UVA", "CEREZA", "LIMON", "PAPAYA"],
  "Animales": ["PERRO", "GATO", "TIGRE", "LEON", "ZORRO", "CABALLO", "DELFIN", "AGUILA", "OSO", "CONEJO"],
  "Colores": ["ROJO", "AZUL", "VERDE", "AMARILLO", "NEGRO", "BLANCO", "GRIS", "MORADO", "ROSA", "CELESTE"],
  "Tecnología": ["COMPUTADORA", "CELULAR", "TABLETA", "CARGADOR", "TECLADO", "MONITOR", "SOFTWARE", "HARDWARE", "APP", "ROUTER"],
  "Deportes": ["FUTBOL", "BASQUET", "TENIS", "NATACION", "CICLISMO", "GOLF", "BOXEO", "SKATE", "SURF", "BEISBOL"],
  "Comida": ["PIZZA", "PASTA", "ARROZ", "TACO", "ENSALADA", "SOPA", "CARNE", "PESCADO", "QUESO", "HAMBURGUESA"]
};

const palette = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f1c40f', '#1abc9c', '#e67e22', '#34495e', '#ff69b4', '#8e44ad'];
let gridSize, selected = [], foundWords = [], words = [], colorMap = {}, grid = [];

const gridContainer = document.getElementById('grid');
const wordList = document.getElementById('wordList');
const categorySel = document.getElementById('category');
const difficultySel = document.getElementById('difficulty');
const endCard = document.getElementById('endCard');
const categoryEndSel = document.getElementById('categoryEnd');
const difficultyEndSel = document.getElementById('difficultyEnd');

function initGame() {
  gridSize = parseInt(difficultySel.value);
  grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
  const cat = categorySel.value;
  words = shuffle(wordsByCategory[cat]).slice(0, Math.min(gridSize + 2, wordsByCategory[cat].length));
  colorMap = {}; selected = []; foundWords = [];
  wordList.innerHTML = '';
  endCard.style.display = 'none';

  categoryEndSel.innerHTML = categorySel.innerHTML;
  difficultyEndSel.innerHTML = difficultySel.innerHTML;
  categoryEndSel.value = cat;
  difficultyEndSel.value = difficultySel.value;

  words.forEach((w, i) => colorMap[w] = palette[i % palette.length]);
  placeWords(); fillGrid(); drawGrid(); updateWordList();
}

function placeWords() {
  for (let word of words) {
    let placed = false;
    while (!placed) {
      const dir = [[0,1],[1,0],[1,1],[1,-1]][Math.floor(Math.random()*4)];
      const row = Math.floor(Math.random()*gridSize);
      const col = Math.floor(Math.random()*gridSize);
      if (canPlace(word, row, col, dir)) {
        for (let i = 0; i < word.length; i++) {
          grid[row + i*dir[0]][col + i*dir[1]] = word[i];
        }
        placed = true;
      }
    }
  }
}

function canPlace(word, r, c, d) {
  for (let i = 0; i < word.length; i++) {
    let rr = r + i*d[0], cc = c + i*d[1];
    if (rr < 0 || cc < 0 || rr >= gridSize || cc >= gridSize) return false;
    if (grid[rr][cc] && grid[rr][cc] !== word[i]) return false;
  }
  return true;
}

function fillGrid() {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < gridSize; r++)
    for (let c = 0; c < gridSize; c++)
      if (!grid[r][c]) grid[r][c] = abc[Math.floor(Math.random()*abc.length)];
}

function drawGrid() {
  gridContainer.innerHTML = '';
  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 32px)`;
  for (let r = 0; r < gridSize; r++)
    for (let c = 0; c < gridSize; c++) {
      const div = document.createElement('div');
      div.className = 'cell';
      div.textContent = grid[r][c];
      div.dataset.row = r;
      div.dataset.col = c;
      div.addEventListener('mousedown', startSelect);
    div.addEventListener('touchstart', startSelect);
      div.addEventListener('touchstart', startSelect);
      div.addEventListener('mouseenter', dragSelect);
      div.addEventListener('mouseup', endSelect);
    div.addEventListener('touchend', endSelect);
      div.addEventListener('touchend', endSelect);
      gridContainer.appendChild(div);
    }
}

function updateWordList() {
  wordList.innerHTML = words.map(w => `<li id="w-${w}">${w}</li>`).join('');
}

let isMouseDown = false;
function startSelect(e) {
    if (e.touches) e = e.touches[0];  // Asegurar que 'e' sea correcto en dispositivos táctiles
    selected = []; // reiniciar la selección de palabras
    foundWords = []; // reiniciar las palabras encontradas
    startRow = Math.floor((e.pageY - div.offsetTop) / gridSize); 
    startCol = Math.floor((e.pageX - div.offsetLeft) / gridSize);
  isMouseDown = true;
  selected = [{row: +e.target.dataset.row, col: +e.target.dataset.col, el: e.target}];
  e.target.classList.add('selected');
}

function dragSelect(e) {
  if (!isMouseDown) return;
  const exists = selected.some(s => s.el === e.target);
  if (!exists) {
    selected.push({row: +e.target.dataset.row, col: +e.target.dataset.col, el: e.target});
    e.target.classList.add('selected');
  }
}

function endSelect() {
  isMouseDown = false;
  const word = selected.map(c => grid[c.row][c.col]).join('');
  const rev = selected.map(c => grid[c.row][c.col]).reverse().join('');
  const found = words.find(w => w === word || w === rev);
  if (found && !foundWords.includes(found)) {
    selected.forEach(c => {
      c.el.classList.remove('selected');
      c.el.classList.add('found');
      c.el.style.backgroundColor = colorMap[found];
    });
    document.getElementById('w-'+found).classList.add('found');
    foundWords.push(found);
    if (foundWords.length === words.length) endCard.style.display = 'block';
  } else {
    selected.forEach(c => c.el.classList.remove('selected'));
  }
  selected = [];
}

function restartGame() {
  categorySel.value = categoryEndSel.value;
  difficultySel.value = difficultyEndSel.value;
  initGame();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
