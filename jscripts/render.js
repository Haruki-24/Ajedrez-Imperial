// render.js — Motor de Renderizado Ajedrez Imperial 10x10
// Grid 14x14. Perspectiva 2.5D fija: rotateX(15deg) rotateZ(60deg).

import {
    BOARD_SIZE,
    COLOR_THEMES,
    PIECE_THEMES,
    PIECES,
    getPieceImagePath,
    getSquareNotation
} from './constants.js';

// ============================================================
// ESTADO INTERNO
// ============================================================
let currentColorTheme = 'classic';
let currentPieceTheme = 'classic';
let currentPerspective = '2d';
let showCoords = false;

let boardContainer = null;
let turnTextEl = null;
let turnIndicatorEl = null;
let whiteCapturesEl = null;
let blackCapturesEl = null;
let onSquareClick = null;

// ============================================================
// 1. INICIALIZACIÓN
// ============================================================

export function initRender(handleSquareClick) {
    boardContainer = document.getElementById('board');
    turnTextEl = document.getElementById('turn-text');
    turnIndicatorEl = document.getElementById('turn-indicator-color');
    whiteCapturesEl = document.getElementById('white-captures');
    blackCapturesEl = document.getElementById('black-captures');
    onSquareClick = handleSquareClick;

    if (!boardContainer) {
        console.error('[render.js] No se encontró #board');
        return;
    }

    applyColorTheme(currentColorTheme);
    applyPerspective(currentPerspective);
    console.log('[render.js] Inicializado');
}

// ============================================================
// 2. API PÚBLICA
// ============================================================

export function setColorTheme(name) {
    if (!COLOR_THEMES[name]) {
        console.warn(`[render.js] Tema de color "${name}" no existe`);
        return;
    }
    currentColorTheme = name;
    applyColorTheme(name);
    console.log(`[render.js] Tema de color: ${name}`);
}

export function setPieceTheme(name) {
    if (!PIECE_THEMES[name]) {
        console.warn(`[render.js] Tema de piezas "${name}" no existe`);
        return;
    }
    currentPieceTheme = name;
    console.log(`[render.js] Tema de piezas: ${name}`);
}

export function setPerspective(p) {
    if (!['2d', '2.5d', '3d'].includes(p)) {
        console.warn(`[render.js] Perspectiva "${p}" inválida`);
        return;
    }
    currentPerspective = p;
    applyPerspective(p);
    console.log(`[render.js] Perspectiva: ${p}`);
}

export function toggleCoords() {
    showCoords = !showCoords;
}

export function getShowCoords() {
    return showCoords;
}

// ============================================================
// 3. RENDERIZADO PRINCIPAL (Grid 14x14)
// ============================================================

export function renderBoard(gameState) {
    if (!boardContainer) {
        console.error('[render.js] boardContainer es null');
        return;
    }

    // Validación suave: si no hay gameState, no crashear
    if (!gameState || typeof gameState !== 'object') {
        console.warn('[render.js] gameState no disponible, omitiendo render');
        return;
    }

    const board = gameState.board;
    const selectedPiece = gameState.selectedPiece;
    const validMoves = Array.isArray(gameState.validMoves) ? gameState.validMoves : [];
    const lastMove = gameState.lastMove;
    const turn = gameState.turn;
    const kingPositions = gameState.kingPositions || { white: null, black: null };

    if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
        console.error('[render.js] Tablero inválido:', board);
        return;
    }

    const theme = COLOR_THEMES[currentColorTheme] || COLOR_THEMES.classic;
    const pieceTheme = PIECE_THEMES[currentPieceTheme] || PIECE_THEMES.classic;

    boardContainer.innerHTML = '';

    try {
        const GRID_SIZE = BOARD_SIZE + 4; // 14
        const skipCells = new Set();

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (skipCells.has(`${r},${c}`)) continue;

                const square = document.createElement('div');
                square.style.gridRow = String(r + 1);
                square.style.gridColumn = String(c + 1);

                // ============================================================
                // FILA 0 — NORTE (span 10 cols) + esquinas
                // ============================================================
                if (r === 0) {
                    if (c === 0 || c === 1 || c === 12 || c === 13) {
                        square.className = 'square edge-cell corner-cell';
                    } else if (c === 2) {
                        square.className = 'square label-north';
                        square.innerText = 'NORTE';
                        square.style.gridColumn = '3 / span 10';
                        for (let i = 3; i <= 11; i++) skipCells.add(`0,${i}`);
                    }
                    boardContainer.appendChild(square);
                    continue;
                }

                // ============================================================
                // FILA 13 — SUR (span 10 cols) + esquinas
                // ============================================================
                if (r === 13) {
                    if (c === 0 || c === 1 || c === 12 || c === 13) {
                        square.className = 'square edge-cell corner-cell';
                    } else if (c === 2) {
                        square.className = 'square label-south';
                        square.innerText = 'SUR';
                        square.style.gridColumn = '3 / span 10';
                        for (let i = 3; i <= 11; i++) skipCells.add(`13,${i}`);
                    }
                    boardContainer.appendChild(square);
                    continue;
                }

                // ============================================================
                // FILA 1 — borde vacío transparente + esquinas
                // ============================================================
                if (r === 1) {
                    if (c === 0 || c === 1 || c === 12 || c === 13) {
                        square.className = 'square edge-cell corner-cell';
                    } else {
                        square.className = 'square border-transparent';
                    }
                    boardContainer.appendChild(square);
                    continue;
                }

                // ============================================================
                // FILA 12 — coordenadas X + esquinas
                // ============================================================
                if (r === 12) {
                    if (c === 0 || c === 1 || c === 12 || c === 13) {
                        square.className = 'square edge-cell corner-cell';
                    } else {
                        square.className = 'square edge-cell';
                        const gameCol = c - 2;
                        square.innerText = (gameCol < 5) ? `${5 - gameCol}O` : `${gameCol - 4}E`;
                    }
                    boardContainer.appendChild(square);
                    continue;
                }

                // ============================================================
                // COLUMNA 0 — OESTE (span 10 rows) + esquinas
                // ============================================================
                if (c === 0) {
                    if (r === 2) {
                        square.className = 'square label-west';
                        square.innerText = 'OESTE';
                        square.style.gridRow = '3 / span 10';
                        square.style.gridColumn = '1';
                        for (let i = 3; i <= 11; i++) skipCells.add(`${i},0`);
                    } else {
                        square.className = 'square edge-cell corner-cell';
                    }
                    boardContainer.appendChild(square);
                    continue;
                }

                // ============================================================
                // COLUMNA 13 — ESTE (span 10 rows) + esquinas
                // ============================================================
                if (c === 13) {
                    if (r === 2) {
                        square.className = 'square label-east';
                        square.innerText = 'ESTE';
                        square.style.gridRow = '3 / span 10';
                        square.style.gridColumn = '14';
                        for (let i = 3; i <= 11; i++) skipCells.add(`${i},13`);
                    } else {
                        square.className = 'square edge-cell corner-cell';
                    }
                    boardContainer.appendChild(square);
                    continue;
                }

                // ============================================================
                // COLUMNA 1 — borde vacío transparente
                // ============================================================
                if (c === 1) {
                    square.className = 'square border-transparent';
                    boardContainer.appendChild(square);
                    continue;
                }

                // ============================================================
                // COLUMNA 12 — coordenadas Y
                // ============================================================
                if (c === 12) {
                    square.className = 'square edge-cell';
                    const gameRow = r - 2;
                    square.innerText = (gameRow < 5) ? `${5 - gameRow}N` : `${gameRow - 4}S`;
                    boardContainer.appendChild(square);
                    continue;
                }

                // ============================================================
                // ÁREA DE JUEGO 10×10 (filas 2-11, cols 2-11)
                // ============================================================
                const gameRow = r - 2;
                const gameCol = c - 2;
                const isLight = (gameRow + gameCol) % 2 === 0;
                square.className = `square ${isLight ? 'light' : 'dark'}`;

                let bgColor = isLight ? theme.light : theme.dark;

                if (selectedPiece && selectedPiece.r === gameRow && selectedPiece.c === gameCol) {
                    bgColor = isLight ? theme.lightHighlight : theme.darkHighlight;
                }

                if (lastMove) {
                    const isFrom = lastMove.from && lastMove.from.r === gameRow && lastMove.from.c === gameCol;
                    const isTo = lastMove.to && lastMove.to.r === gameRow && lastMove.to.c === gameCol;
                    if (isFrom || isTo) {
                        bgColor = isLight ? theme.lastMoveLight : theme.lastMoveDark;
                    }
                }

                if (gameState.isCheck && kingPositions[turn] && kingPositions[turn].r === gameRow && kingPositions[turn].c === gameCol) {
                    bgColor = theme.check;
                }

                square.style.backgroundColor = bgColor;
                applySquarePerspective(square, isLight);

                const piece = board[gameRow] && board[gameRow][gameCol];
                if (piece) {
                    const pieceEl = createPieceElement(piece, pieceTheme);
                    if (pieceEl) square.appendChild(pieceEl);
                }

                const move = validMoves.find(m => m && m.r === gameRow && m.c === gameCol);
                if (move) {
                    const marker = document.createElement('div');
                    marker.className = move.capture ? 'valid-capture-ring' : 'valid-move-dot';
                    square.appendChild(marker);
                }

                // Coordenadas internas de casilla (siempre renderizadas, visibles vía CSS)
                const coord = document.createElement('span');
                coord.className = 'square-coord';
                coord.innerText = getSquareNotation(gameRow, gameCol);
                square.appendChild(coord);
                if (showCoords) {
                    square.classList.add('show-coords');
                }

                square.addEventListener('click', () => {
                    if (onSquareClick) onSquareClick(gameRow, gameCol);
                });

                boardContainer.appendChild(square);
            }
        }
    } catch (err) {
        console.error('[render.js] Error renderizando tablero:', err);
    }
}

// ============================================================
// 4. ELEMENTOS
// ============================================================

function createPieceElement(piece, theme) {
    if (!piece || !piece.type || !piece.color) return null;

    const wrapper = document.createElement('div');
    wrapper.className = `piece ${piece.color}`;

    // ============================================================
    // ESCALA DINÁMICA CORREGIDA
    // ============================================================
    const scales = theme.scales || {};
    
    // Obtenemos el nombre de archivo correspondiente (base o promocionado)
    const pieceInfo = PIECES[piece.type];
    const scaleKey = pieceInfo 
        ? (piece.promoted ? pieceInfo.promoted : pieceInfo.base) 
        : piece.type;
    
    // Buscamos: 1) por nombre de imagen, 2) por tipo interno, 3) default
    const pieceScale = scales[scaleKey] || scales[piece.type] || scales.default || 1;
    
    wrapper.style.setProperty('--piece-scale', pieceScale);
    // ============================================================

    const img = document.createElement('img');
    const src = getPieceImagePath(piece, theme);
    img.src = src || '';
    img.className = 'piece-image';
    img.alt = piece.type;
    img.draggable = false;
    img.onerror = () => { img.style.display = 'none'; };
    wrapper.appendChild(img);

    if (!piece.promoted && piece.kills > 0) {
        const stars = document.createElement('span');
        stars.className = 'stars-badge';
        stars.innerText = '★'.repeat(Math.min(piece.kills, 3));
        wrapper.appendChild(stars);
    }

    return wrapper;
}

// ============================================================
// 5. PERSPECTIVAS
// ============================================================

function applyPerspective(perspective) {
    if (!boardContainer) return;
    boardContainer.classList.remove('perspective-2d', 'perspective-2-5d', 'perspective-3d');
    boardContainer.classList.add(`perspective-${perspective.replace('.', '-')}`);
    boardContainer.style.transform = '';
    boardContainer.style.transformStyle = '';
}

function applySquarePerspective(square, isLight) {
    square.style.transform = '';
    square.style.transformOrigin = '';
    square.style.margin = '';
    square.style.boxShadow = '';

    if (currentPerspective === '2.5d') {
        square.style.boxShadow = isLight
            ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.1)'
            : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)';
    } else if (currentPerspective === '3d') {
        const elevation = isLight ? 0 : 3;
        square.style.transform = `translateZ(${elevation}px)`;
        square.style.boxShadow = isLight ? 'none' : '0 3px 6px rgba(0,0,0,0.4)';
        square.style.transition = 'transform 0.15s ease';
    }
}

// ============================================================
// 6. TEMAS DE COLOR
// ============================================================

function applyColorTheme(name) {
    const theme = COLOR_THEMES[name];
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--sq-light', theme.light);
    root.style.setProperty('--sq-dark', theme.dark);
    root.style.setProperty('--sq-light-hl', theme.lightHighlight);
    root.style.setProperty('--sq-dark-hl', theme.darkHighlight);
    root.style.setProperty('--sq-last-light', theme.lastMoveLight);
    root.style.setProperty('--sq-last-dark', theme.lastMoveDark);
    root.style.setProperty('--sq-check', theme.check);
}

// ============================================================
// 7. UI
// ============================================================

export function updateUI(turn, capturedPawns) {
    if (turnTextEl) {
        turnTextEl.textContent = turn === 'none' ? 'Fin' : (turn === 'white' ? 'Blancas' : 'Negras');
    }
    if (turnIndicatorEl) {
        turnIndicatorEl.className = `w-4 h-4 rounded-full border border-gray-400 ${
            turn === 'white' ? 'bg-white' :
            turn === 'black' ? 'bg-[#111]' :
            'bg-red-500'
        }`;
    }
    if (whiteCapturesEl) {
        whiteCapturesEl.textContent = capturedPawns?.white ?? 0;
    }
    if (blackCapturesEl) {
        blackCapturesEl.textContent = capturedPawns?.black ?? 0;
    }
}

export function showMessage(text, duration = 3000) {
    const msgEl = document.getElementById('game-message');
    if (!msgEl) return;

    msgEl.textContent = text;
    msgEl.style.opacity = '0';
    requestAnimationFrame(() => {
        msgEl.style.opacity = '1';
    });

    if (duration > 0 && !text.includes('Ganan') && !text.includes('iniciada')) {
        setTimeout(() => {
            if (msgEl.textContent === text) msgEl.textContent = '';
        }, duration);
    }
}

// ============================================================