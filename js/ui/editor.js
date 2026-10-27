// js/ui/editor.js — Editor de práctica
// Permite colocar/quitar piezas, probar la posición en modo manual y deshacer.

import { 
    initRender, renderBoard, updateUI, showMessage, 
    setColorTheme, setPieceTheme, setPerspective
} from './render.js';

import {
    createInitialBoard,
    getLegalMovesState,
    isKingInCheckState
} from '../core/game.js';

import { 
    BOARD_SIZE, 
    PIECES, 
    getSquareNotation, 
    getPieceSymbol 
} from '../core/constants.js';
import { PIECE_THEMES } from '../core/constants-scenes.js';

// ============================================================
// ESTADO LOCAL DEL EDITOR
// ============================================================
let board = [];
let turn = 'white';
let selectedPiece = null;
let validMoves = [];
let lastMove = null;
let moveHistory = [];       // Stack para deshacer (solo en modo juego)

let editorColor = 'white';  // Color activo en la paleta
let selectedPalettePiece = null; // Pieza de la paleta seleccionada
let selectedTool = null;    // null | 'eraser'
let isPlayMode = false;     // false = Edición, true = Juego manual

// Mapeo de nombres de paleta a objetos de pieza
const PALETTE_MAP = {
    'peon':        { type: 'pawn',    promoted: false },
    'sargento':    { type: 'pawn',    promoted: true  },
    'vigia':       { type: 'rook',    promoted: false },
    'torre':       { type: 'rook',    promoted: true  },
    'caballo':     { type: 'knight',  promoted: false },
    'caballero':   { type: 'knight',  promoted: true  },
    'escudero':    { type: 'bishop',  promoted: false },
    'alfil':       { type: 'bishop',  promoted: true  },
    'paladin':     { type: 'paladin', promoted: false },
    'general_real':{ type: 'paladin', promoted: true  },
    'reina':       { type: 'queen',   promoted: false },
    'emperatriz':  { type: 'queen',   promoted: true  },
    'emperador':   { type: 'king',    promoted: false }
};
const PALETTE_ORDER = Object.keys(PALETTE_MAP);

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Render (tema clásico, perspectiva 2D corregida)
    initRender(onSquareClick);
    setColorTheme('classic');
    setPieceTheme('classic');
    setPerspective('2d'); // <--- CORREGIDO: antes decía '2.d'

    // 2. Estado inicial: tablero vacío
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    // 3. Renderizar UI y tablero
    renderPalette();
    bindUIEvents();
    updateAllUI();
    showMessage('Modo Edición activo. Coloca piezas en el tablero.');
});

// ============================================================
// PALETA DE PIEZAS
// ============================================================
function renderPalette() {
    const palette = document.getElementById('editor-palette');
    if (!palette) return;
    palette.innerHTML = '';

    const theme = PIECE_THEMES['classic'];

    PALETTE_ORDER.forEach(name => {
        const div = document.createElement('div');
        div.className = 'palette-piece bg-[#262421] rounded p-1 flex items-center justify-center aspect-square cursor-pointer border border-transparent hover:border-gray-500 transition';
        div.dataset.piece = name;

        const img = document.createElement('img');
        const pieceKey = PALETTE_MAP[name].promoted ? PIECES[PALETTE_MAP[name].type].promoted : PIECES[PALETTE_MAP[name].type].base;
        img.src = theme[editorColor][pieceKey] || '';
        img.className = 'w-7 h-7 object-contain pointer-events-none';

        div.appendChild(img);
        div.onclick = () => selectPalettePiece(name, div);
        palette.appendChild(div);
    });
}

function selectPalettePiece(name, element) {
    selectedTool = null;
    selectedPalettePiece = name;
    
    document.querySelectorAll('.palette-piece').forEach(el => el.classList.remove('border-yellow-500', 'bg-[#4b4843]'));
    const eraserBtn = document.getElementById('tool-eraser');
    if (eraserBtn) eraserBtn.classList.remove('border-yellow-500', 'bg-[#3e3c39]');
    
    element.classList.add('border-yellow-500', 'bg-[#4b4843]');
    showMessage(`Seleccionado: ${name} (${editorColor === 'white' ? 'Blancas' : 'Negras'})`);
}

function setColor(color) {
    editorColor = color;
    
    const btnW = document.getElementById('color-white');
    const btnB = document.getElementById('color-black');
    
    if (color === 'white') {
        btnW.className = 'px-3 py-1 rounded text-xs font-bold bg-white text-[#262421] transition';
        btnB.className = 'px-3 py-1 rounded text-xs font-bold text-gray-400 hover:text-white transition';
    } else {
        btnW.className = 'px-3 py-1 rounded text-xs font-bold text-gray-400 hover:text-white transition';
        btnB.className = 'px-3 py-1 rounded text-xs font-bold bg-[#111] text-white border border-gray-600 transition';
    }
    
    renderPalette();
    if (selectedPalettePiece) {
        showMessage(`Seleccionado: ${selectedPalettePiece} (${color === 'white' ? 'Blancas' : 'Negras'})`);
    }
}

function setTool(tool) {
    if (tool === 'eraser') {
        selectedPalettePiece = null;
        selectedTool = 'eraser';
        document.querySelectorAll('.palette-piece').forEach(el => el.classList.remove('border-yellow-500', 'bg-[#4b4843]'));
        const eraserBtn = document.getElementById('tool-eraser');
        if (eraserBtn) eraserBtn.classList.add('border-yellow-500', 'bg-[#3e3c39]');
        showMessage('Borrador activado. Clic en una pieza para eliminarla.');
    }
}

// ============================================================
// INTERACCIÓN CON EL TABLERO
// ============================================================
function onSquareClick(r, c) {
    if (isPlayMode) {
        handlePlayClick(r, c);
    } else {
        handleEditClick(r, c);
    }
}

function handleEditClick(r, c) {
    // 1. Borrador
    if (selectedTool === 'eraser') {
        if (board[r][c]) {
            board[r][c] = null;
            updateAllUI();
            showMessage('Pieza eliminada.');
        }
        return;
    }

    // 2. Colocar pieza
    if (selectedPalettePiece) {
        const data = PALETTE_MAP[selectedPalettePiece];
        if (board[r][c]) {
            showMessage('Casilla ocupada. Usa el borrador primero.');
            return;
        }

        board[r][c] = {
            type: data.type,
            color: editorColor,
            promoted: data.promoted,
            kills: 0,
            hasMoved: false
        };
        updateAllUI();
        showMessage(`${selectedPalettePiece} colocado.`);
        return;
    }

    // 3. Mover pieza (solo en edición)
    if (board[r][c] && !selectedPalettePiece && !selectedTool) {
        if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
            selectedPiece = null; // Deseleccionar
        } else {
            selectedPiece = { r, c };
        }
        updateAllUI();
        return;
    }

    if (selectedPiece && !board[r][c] && !selectedPalettePiece) {
        board[r][c] = board[selectedPiece.r][selectedPiece.c];
        board[selectedPiece.r][selectedPiece.c] = null;
        selectedPiece = null;
        updateAllUI();
        showMessage('Pieza movida (edición).');
        return;
    }
}

function handlePlayClick(r, c) {
    if (turn === 'none') return;

    const piece = board[r][c];
    const move = validMoves.find(m => m.r === r && m.c === c);

    // Mover pieza
    if (selectedPiece && move) {
        const movingPiece = board[selectedPiece.r][selectedPiece.c];
        
        // 1. CONSTRUIR LA NOTACIÓN IMPERIAL
        const fromNot = getSquareNotation(selectedPiece.r, selectedPiece.c);
        const toNot = getSquareNotation(r, c);
        const pSymbol = getPieceSymbol(movingPiece, selectedPiece.c);
        const notationStr = `${pSymbol}: ${fromNot} -> ${toNot}`;
        
        // 2. Guardar estado
        const state = {
            board: board.map(row => row.map(p => p ? { ...p } : null)),
            turn: turn,
            lastMove: lastMove ? { ...lastMove } : null,
            notation: notationStr // <--- Guardamos el string formateado
        };
        moveHistory.push(state);

        // 3. Ejecutar el movimiento
        executeMove(selectedPiece.r, selectedPiece.c, r, c);
        selectedPiece = null;
        validMoves = [];
        
        if (turn !== 'none') switchTurn();
        
        updateAllUI();
        renderHistory();
        return;
    }

    // Seleccionar pieza
    if (piece && piece.color === turn) {
        selectedPiece = { r, c };
        validMoves = getLegalMovesState(board, r, c, lastMove);
        updateAllUI();
    } else {
        selectedPiece = null;
        validMoves = [];
        updateAllUI();
    }
}

// ============================================================
// MOTOR DE MOVIMIENTOS (Lógica oficial adaptada)
// ============================================================
function executeMove(sr, sc, tr, tc) {
    const piece = board[sr][sc];
    if (!piece) return;

    const target = board[tr][tc];
    
    // 1. Capturas y ascensos por captura
    if (target) {
        if (target.type === 'pawn' && (piece.type === 'rook' || piece.type === 'bishop')) {
            if (!piece.promoted) {
                piece.kills = (piece.kills || 0) + 1;
                if (piece.kills >= 3) {
                    piece.promoted = true;
                    piece.kills = 0;
                    showMessage('¡Ascenso por captura!');
                }
            }
        }
        if (piece.type === 'queen' && !piece.promoted) {
            piece.promoted = true;
            showMessage('¡Reina ascendida!');
        }
    }

    // 2. En Passant
    if (!target && piece.type === 'pawn' && Math.abs(tc - sc) === 1) {
        const capturedRow = piece.color === 'white' ? tr + 1 : tr - 1;
        const capturedPawn = board[capturedRow][tc];
        if (capturedPawn && capturedPawn.type === 'pawn' && capturedPawn.color !== piece.color) {
            board[capturedRow][tc] = null;
        }
    }

    // 3. Enroque
    if (piece.type === 'king' && Math.abs(tc - sc) > 1) {
        if (tc === 8) { // Flanco Derecho
            board[tr][7] = board[tr][9];
            board[tr][9] = null;
            board[tr][7].hasMoved = true;
        } else if (tc === 1) { // Flanco Izquierdo
            board[tr][2] = board[tr][0];
            board[tr][0] = null;
            board[tr][2].hasMoved = true;
        }
    }

    // 4. Mover pieza
    board[tr][tc] = piece;
    board[sr][sc] = null;
    piece.hasMoved = true;
    
    // 5. Promoción por territorio
    if (!piece.promoted && (piece.type === 'pawn' || piece.type === 'knight' || piece.type === 'paladin')) {
        const inZone = (piece.color === 'white' && tr <= 1) || (piece.color === 'black' && tr >= 8);
        if (inZone) {
            piece.promoted = true;
            showMessage('¡Ascenso por territorio!');
        }
    }

    lastMove = { from: { r: sr, c: sc }, to: { r: tr, c: tc }, pieceType: piece.type };
}

function switchTurn() {
    turn = turn === 'white' ? 'black' : 'white';
    updateAllUI();
}

// ============================================================
// MODOS: EDIT / PLAY
// ============================================================
function startPlayMode() {
    let hasWhiteKing = false, hasBlackKing = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.type === 'king') {
                if (p.color === 'white') hasWhiteKing = true;
                if (p.color === 'black') hasBlackKing = true;
            }
        }
    }

    if (!hasWhiteKing || !hasBlackKing) {
        showMessage('Error: Debes colocar un Emperador de cada color.');
        return;
    }

    isPlayMode = true;
    turn = 'white';
    selectedPiece = null;
    validMoves = [];
    moveHistory = [];
    lastMove = null;

    document.getElementById('editor-controls').classList.add('hidden');
    document.getElementById('play-controls').classList.remove('hidden');
    document.getElementById('play-controls').classList.add('flex');
    document.getElementById('btn-play').classList.add('hidden');
    document.getElementById('btn-stop').classList.remove('hidden');
    document.getElementById('btn-stop').classList.add('flex');

    updateAllUI();
    renderHistory();
    showMessage('Modo Juego activo. Blancas mueven primero.');
}

function stopPlayMode() {
    isPlayMode = false;
    selectedPiece = null;
    validMoves = [];
    
    document.getElementById('editor-controls').classList.remove('hidden');
    document.getElementById('play-controls').classList.add('hidden');
    document.getElementById('play-controls').classList.remove('flex');
    document.getElementById('btn-play').classList.remove('hidden');
    document.getElementById('btn-stop').classList.add('hidden');
    document.getElementById('btn-stop').classList.remove('flex');

    updateAllUI();
    showMessage('Juego detenido. Posición congelada. Puedes editar.');
}

// ============================================================
// HERRAMIENTAS ADICIONALES
// ============================================================
function clearBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    selectedPiece = null;
    updateAllUI();
    showMessage('Tablero vaciado.');
}

function loadInitialPosition() {
    board = createInitialBoard();
    selectedPiece = null;
    updateAllUI();
    showMessage('Posición inicial cargada.');
}

function undoMove() {
    if (moveHistory.length === 0) {
        showMessage('No hay movimientos para deshacer.');
        return;
    }
    const state = moveHistory.pop();
    board = state.board;
    turn = state.turn;
    lastMove = state.lastMove;
    selectedPiece = null;
    validMoves = [];
    
    updateAllUI();
    renderHistory();
    showMessage('Movimiento deshecho.');
}

// ============================================================
// RENDERIZADO DE UI
// ============================================================
function updateAllUI() {
    const kingPositions = { white: null, black: null };
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.type === 'king') kingPositions[p.color] = { r, c };
        }
    }

    const gameState = {
        board,
        selectedPiece,
        validMoves,
        lastMove,
        turn,
        kingPositions,
        isCheck: isKingInCheckState(board, turn, lastMove)
    };

    renderBoard(gameState);
    updateUI(turn, { white: 0, black: 0 });
}

function renderHistory() {
    const listEl = document.getElementById('move-history-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    if (moveHistory.length === 0) {
        listEl.innerHTML = '<div class="text-gray-500 text-xs italic text-center py-4">Sin movimientos</div>';
        return;
    }
    
    moveHistory.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'border-b border-[#3e3c39] py-1 flex justify-between items-center';
        
        const colorClass = m.turn === 'white' ? 'text-white' : 'text-gray-400';
        const prefix = m.turn === 'white' ? 'B' : 'N';
        
        div.innerHTML = `
            <span class="text-gray-500 text-xs">${i + 1}.</span>
            <span class="${colorClass} font-semibold">${prefix} - ${m.notation}</span>
        `;
        listEl.appendChild(div);
    });
    listEl.scrollTop = listEl.scrollHeight;
}

// ============================================================
// EVENTOS DE UI
// ============================================================
function bindUIEvents() {
    document.getElementById('color-white')?.addEventListener('click', () => setColor('white'));
    document.getElementById('color-black')?.addEventListener('click', () => setColor('black'));
    document.getElementById('tool-eraser')?.addEventListener('click', () => setTool('eraser'));
    document.getElementById('btn-clear')?.addEventListener('click', clearBoard);
    document.getElementById('btn-load-initial')?.addEventListener('click', loadInitialPosition);
    document.getElementById('btn-play')?.addEventListener('click', startPlayMode);
    document.getElementById('btn-stop')?.addEventListener('click', stopPlayMode);
    document.getElementById('btn-undo')?.addEventListener('click', undoMove);
}

// Exponer funciones globales
window.setColor = setColor;
window.setTool = setTool;
window.loadInitialPosition = loadInitialPosition;
window.clearBoard = clearBoard;
window.startPlayMode = startPlayMode;