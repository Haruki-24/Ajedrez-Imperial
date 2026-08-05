// game.js — Motor de Reglas Ajedrez Imperial 10x10
// Arquitectura ES6. Funciones puras (*State) reutilizables por cpu.js.
// OPTIMIZADO: lastMoveState fluye por toda la cadena, isSquareAttackedState
// invertido (direccional), MOVEMENT_VECTORS integrado, en passant corregido.

import { renderBoard, updateUI, showMessage } from './render.js';
import { TRANSLATIONS, getCurrentLang, updateTurnText } from './translate.js';
import {
    BOARD_SIZE, PIECES, PROMOTION_ZONE, PAWN_KILLERS,
    ZONE_PROMOTABLES, KILLS_TO_PROMOTE, STARTING_BACK_ROW,
    MOVEMENT_VECTORS, getPieceSymbol, getSquareNotation
} from './constants.js';

// HELPER DE TRADUCCIÓN
function msg(key, ...args) {
    const lang = getCurrentLang();
    const t = TRANSLATIONS[lang]?.messages;
    if (!t) return key;
    const val = t[key];
    return typeof val === 'function' ? val(...args) : val;
}

// ESTADO GLOBAL DEL JUEGO (UI únicamente)
let board = [];
let turn = 'white';
let selectedPiece = null;
let validMoves = [];
let lastMove = null;
let moveHistory = [];       // stack de estados para undo
let moveHistoryText = [];   // notaciones para UI
let capturedPawns = { white: 0, black: 0 };
let gameMode = 'pvc';
let cpuThinking = false;

// 1. INICIALIZACIÓN
function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = createPiece(STARTING_BACK_ROW[c], 'black');
        board[1][c] = createPiece('pawn', 'black');
        board[8][c] = createPiece('pawn', 'white');
        board[9][c] = createPiece(STARTING_BACK_ROW[c], 'white');
    }
}

function createPiece(type, color) {
    return { type, color, promoted: false, kills: 0, hasMoved: false };
}

export function getGameState() {
    const kingPositions = { white: null, black: null };
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.type === 'king') {
                kingPositions[p.color] = { r, c };
            }
        }
    }
    return {
        board,
        selectedPiece,
        validMoves,
        lastMove,
        turn,
        kingPositions,
        isCheck: isKingInCheckState(board, turn)
    };
}

function afterMove() {
    renderBoard(getGameState());
    updateUI(turn, capturedPawns);
    updateTurnText(turn);
}

// 2. CONTROL DE PARTIDA
export function resetGame() {
    initBoard();
    turn = 'white';
    selectedPiece = null;
    validMoves = [];
    lastMove = null;
    capturedPawns = { white: 0, black: 0 };
    moveHistory = [];
    moveHistoryText = [];
    cpuThinking = false;

    const cpuSelect = document.getElementById('cpu-level');
    if (cpuSelect) cpuSelect.disabled = false;

    afterMove();
    updateHistoryUI();
    showMessage(msg('gameStarted'));
}

export function changeGameMode(mode) {
    gameMode = mode;
    resetGame();
}

// 3. INTERACCIÓN CON EL TABLERO
export function handleSquareClick(r, c) {
    if (cpuThinking || turn === 'none') return;
    if (gameMode === 'pvc' && turn === 'black') return;

    const piece = board[r][c];
    const move = validMoves.find(m => m.r === r && m.c === c);

    if (selectedPiece && move) {
        executeMove(selectedPiece.r, selectedPiece.c, r, c);
        selectedPiece = null;
        validMoves = [];
        if (turn !== 'none') switchTurn();
    } else if (piece && piece.color === turn) {
        selectedPiece = { r, c };
        validMoves = getLegalMoves(r, c);
    } else {
        selectedPiece = null;
        validMoves = [];
    }
    renderBoard(getGameState());
}

// 4. EJECUCIÓN DE MOVIMIENTOS
export function executeMove(sr, sc, tr, tc) {
    const piece = board[sr][sc];
    if (!piece) return;

    const cpuSelect = document.getElementById('cpu-level');
    if (cpuSelect && !cpuSelect.disabled) cpuSelect.disabled = true;

    const target = board[tr][tc];
    let message = "";

    // Guardar estado para undo
    const state = {
        board: board.map(row => row.map(p => p ? { ...p } : null)),
        turn,
        capturedPawns: { ...capturedPawns },
        lastMove: lastMove ? { from: { ...lastMove.from }, to: { ...lastMove.to }, pieceType: lastMove.pieceType } : null
    };
    moveHistory.push(state);

    // --- CAPTURAS ---
    if (target) {
        if (target.type === 'king') {
            board[tr][tc] = piece;
            board[sr][sc] = null;
            lastMove = { from: { r: sr, c: sc }, to: { r: tr, c: tc }, pieceType: piece.type };
            showMessage(msg('checkmate', turn), -1);
            turn = 'none';
            updateHistoryUI(formatMoveNotation(sr, sc, tr, tc, piece, target));
            updateUI(turn, capturedPawns);
            updateTurnText(turn);
            renderBoard(getGameState());
            return;
        }

        if (target.type === 'pawn') {
            capturedPawns[piece.color]++;

            if (PAWN_KILLERS.includes(piece.type) && !piece.promoted) {
                piece.kills = (piece.kills || 0) + 1;
                if (piece.kills >= KILLS_TO_PROMOTE) {
                    piece.promoted = true;
                    piece.kills = 0;
                    const name = piece.type === 'rook'
                        ? (getCurrentLang() === 'es' ? 'Torre de Asedio' : 'Siege Tower')
                        : (getCurrentLang() === 'es' ? 'Alfil Celestial' : 'Celestial Bishop');
                    message = msg('promotePawnKill', name);
                } else {
                    message = msg('pawnCaptured', piece.kills);
                }
            } else {
                message = msg('pawnCaptured', 0);
            }
        }
    }

    // --- EN PASSANT: eliminar peón capturado ---
    if (!target && piece.type === 'pawn' && Math.abs(tc - sc) === 1) {
        // Movimiento diagonal a casilla vacía = en passant
        const capturedRow = piece.color === 'white' ? tr + 1 : tr - 1;
        const capturedPawn = board[capturedRow][tc];
        if (capturedPawn && capturedPawn.type === 'pawn' && capturedPawn.color !== piece.color) {
            board[capturedRow][tc] = null;
            capturedPawns[piece.color]++;
            if (PAWN_KILLERS.includes(piece.type) && !piece.promoted) {
                piece.kills = (piece.kills || 0) + 1;
                if (piece.kills >= KILLS_TO_PROMOTE) {
                    piece.promoted = true;
                    piece.kills = 0;
                    const name = piece.type === 'rook'
                        ? (getCurrentLang() === 'es' ? 'Torre de Asedio' : 'Siege Tower')
                        : (getCurrentLang() === 'es' ? 'Alfil Celestial' : 'Celestial Bishop');
                    message = msg('promotePawnKill', name);
                } else {
                    message = msg('pawnCaptured', piece.kills);
                }
            }
        }
    }

    // --- PROMOCIÓN REINA → EMPERATRIZ ---
    if (!piece.promoted && piece.type === 'queen' && (target || (!target && piece.type === 'pawn' && Math.abs(tc - sc) === 1))) {
        piece.promoted = true;
        message = msg('promoteQueen');
    }

    // --- ENROQUE IMPERIAL ---
    if (piece.type === 'king' && Math.abs(tc - sc) > 1) {
        if (tc === 8) {
            board[tr][7] = board[tr][9];
            board[tr][9] = null;
            board[tr][7].hasMoved = true;
            message = msg('castleRight');
        } else if (tc === 1) {
            board[tr][2] = board[tr][0];
            board[tr][0] = null;
            board[tr][2].hasMoved = true;
            message = msg('castleLeft');
        }
    }

    // --- MOVER PIEZA ---
    const notation = formatMoveNotation(sr, sc, tr, tc, piece, target);
    board[tr][tc] = piece;
    board[sr][sc] = null;
    piece.hasMoved = true;
    lastMove = { from: { r: sr, c: sc }, to: { r: tr, c: tc }, pieceType: piece.type };

    // --- PROMOCIÓN POR TERRITORIO ---
    if (!piece.promoted && ZONE_PROMOTABLES.includes(piece.type)) {
        const inZone = (piece.color === 'white' && tr <= PROMOTION_ZONE.white.maxRow) ||
                       (piece.color === 'black' && tr >= PROMOTION_ZONE.black.minRow);
        if (inZone) {
            piece.promoted = true;
            const names = {
                pawn:     getCurrentLang() === 'es' ? 'Sargento'           : 'Sergeant',
                knight:   getCurrentLang() === 'es' ? 'Caballero Imperial' : 'Imperial Knight',
                paladin:  getCurrentLang() === 'es' ? 'General Real'       : 'Royal General'
            };
            message = msg('promoteZone', names[piece.type]);
        }
    }

    updateHistoryUI(notation);
    if (message) showMessage(message);
}

export function undoMove() {
    if (moveHistory.length === 0) {
        showMessage(msg('noUndo'));
        return;
    }
    const state = moveHistory.pop();
    board = state.board;
    turn = state.turn;
    capturedPawns = state.capturedPawns;
    lastMove = state.lastMove;
    selectedPiece = null;
    validMoves = [];
    moveHistoryText.pop();
    updateHistoryUI();
    updateUI(turn, capturedPawns);
    updateTurnText(turn);
    renderBoard(getGameState());
    showMessage(msg('undoDone'));
}

// 5. CAMBIO DE TURNO Y CONDICIONES DE FIN
export function switchTurn() {
    if (turn === 'none') return;
    turn = turn === 'white' ? 'black' : 'white';
    updateUI(turn, capturedPawns);
    updateTurnText(turn);
    renderBoard(getGameState());

    const nextColor = turn;

    if (isCheckmateState(board, nextColor)) {
        const winner = nextColor === 'white' ? 'black' : 'white';
        showMessage(msg('checkmate', winner), -1);
        turn = 'none';
        updateUI(turn, capturedPawns);
        updateTurnText(turn);
        return;
    }
    if (isStalemateState(board, nextColor)) {
        showMessage(msg('stalemate'), -1);
        turn = 'none';
        updateUI(turn, capturedPawns);
        updateTurnText(turn);
        return;
    }
    if (isKingInCheckState(board, nextColor)) {
        showMessage(msg('check', nextColor));
    }
}

// 6. MOTOR DE MOVIMIENTOS (FUNCIONES PURAS — OPTIMIZADAS)
export function getRawMoves(boardState, r, c, ignoreCastling = false, lastMoveState = null) {
    const piece = boardState[r][c];
    if (!piece) return [];
    let moves = [];

    const addMove = (tr, tc, stopOnCapture = true) => {
        if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE) {
            const target = boardState[tr][tc];
            if (!target) {
                moves.push({ r: tr, c: tc, capture: false });
                return true;
            } else if (target.color !== piece.color) {
                moves.push({ r: tr, c: tc, capture: true });
                return !stopOnCapture;
            }
        }
        return false;
    };

    const dir = piece.color === 'white' ? -1 : 1;
    const lm = lastMoveState || lastMove; // fallback a global para compatibilidad UI

    // 1. Peón / Sargento
    if (piece.type === 'pawn') {
        if (!piece.promoted) {
            const startRow = piece.color === 'white' ? 8 : 1;
            // Avance 1 casilla
            if (!boardState[r + dir]?.[c]) {
                addMove(r + dir, c);
                // Avance 2 casillas desde posición inicial
                if (r === startRow && !boardState[r + dir * 2]?.[c]) {
                    addMove(r + dir * 2, c);
                }
            }
            // Capturas diagonales adelante
            if (boardState[r + dir]?.[c - 1]?.color !== piece.color && boardState[r + dir]?.[c - 1]) addMove(r + dir, c - 1);
            if (boardState[r + dir]?.[c + 1]?.color !== piece.color && boardState[r + dir]?.[c + 1]) addMove(r + dir, c + 1);

            // Captura al paso (en passant)
            if (lm && lm.pieceType === 'pawn' && Math.abs(lm.from.r - lm.to.r) === 2) {
                if (lm.to.r === r && Math.abs(lm.to.c - c) === 1) {
                    const passantR = (lm.from.r + lm.to.r) / 2;
                    moves.push({ r: passantR, c: lm.to.c, capture: true, enPassant: true });
                }
            }
        } else {
            // Sargento: adelante + diagonales adelante + diagonales atrás
            const offsets = [{r: dir, c: 0}, {r: dir, c: -1}, {r: dir, c: 1}, {r: -dir, c: -1}, {r: -dir, c: 1}];
            offsets.forEach(off => addMove(r + off.r, c + off.c));
        }
    }

    // 2. Caballo / Caballero Imperial
    else if (piece.type === 'knight') {
        MOVEMENT_VECTORS.knight.jumps.forEach(jmp => addMove(r + jmp[0], c + jmp[1]));
        if (piece.promoted) {
            // Caballero Imperial: + ortogonal 1 casilla
            const orthoJumps = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            orthoJumps.forEach(jmp => addMove(r + jmp[0], c + jmp[1]));
        }
    }

    // 3. Paladín / General Imperial
    else if (piece.type === 'paladin') {
        if (!piece.promoted) {
            const baseOffsets = [
                {r: dir, c: 0}, {r: dir, c: -1}, {r: dir, c: 1},
                {r: 0, c: -1}, {r: 0, c: 1},
                {r: -dir, c: 0}
            ];
            baseOffsets.forEach(off => addMove(r + off.r, c + off.c));
        } else {
            // General Imperial: ortogonal 1 casilla + diagonales hasta 2 casillas
            const orthoDirs = [{r: -1, c: 0}, {r: 1, c: 0}, {r: 0, c: -1}, {r: 0, c: 1}];
            orthoDirs.forEach(off => addMove(r + off.r, c + off.c));

            const diagDirs = [{r: -1, c: -1}, {r: -1, c: 1}, {r: 1, c: -1}, {r: 1, c: 1}];
            diagDirs.forEach(d => {
                let canContinue = addMove(r + d.r, c + d.c);
                if (canContinue) addMove(r + d.r * 2, c + d.c * 2);
            });
        }
    }

    // 4. Escudero / Alfil
    else if (piece.type === 'bishop') {
        const limit = piece.promoted ? BOARD_SIZE : 2;
        MOVEMENT_VECTORS.bishop.directions.forEach(d => {
            for(let i=1; i<=limit; i++) if(!addMove(r + d[0]*i, c + d[1]*i)) break;
        });
    }

    // 5. Vigía / Torre de Asedio
    else if (piece.type === 'rook') {
        const limit = piece.promoted ? BOARD_SIZE : 2;
        MOVEMENT_VECTORS.rook.directions.forEach(d => {
            for(let i=1; i<=limit; i++) if(!addMove(r + d[0]*i, c + d[1]*i)) break;
        });
    }

    // 6. Reina / Emperatriz
    else if (piece.type === 'queen') {
        if (!piece.promoted) {
            // Reina base: 1 casilla cualquier dirección (como rey)
            MOVEMENT_VECTORS.queen.directions.forEach(d => addMove(r + d[0], c + d[1]));

            // Carga especial: visión en línea recta para captura a distancia
            MOVEMENT_VECTORS.queen.directions.forEach(d => {
                let i = 1;
                while(true) {
                    const tr = r + d[0]*i, tc = c + d[1]*i;
                    if (tr < 0 || tr >= BOARD_SIZE || tc < 0 || tc >= BOARD_SIZE) break;
                    const target = boardState[tr][tc];
                    if (target) {
                        if (target.color !== piece.color) moves.push({r: tr, c: tc, capture: true});
                        break;
                    }
                    i++;
                }
            });
        } else {
            // Emperatriz: alcance infinito total (8 direcciones)
            MOVEMENT_VECTORS.queen.directions.forEach(d => {
                for(let i=1; i<BOARD_SIZE; i++) if(!addMove(r + d[0]*i, c + d[1]*i)) break;
            });
        }
    }

    // 7. Rey / Emperador
    else if (piece.type === 'king') {
        MOVEMENT_VECTORS.king.directions.forEach(d => addMove(r + d[0], c + d[1]));

        // Enroque Imperial
        if (!ignoreCastling && !piece.hasMoved) {
            const opponentColor = piece.color === 'white' ? 'black' : 'white';

            if (!isSquareAttackedState(boardState, r, c, opponentColor, lm)) {
                // Enroque Derecho
                const rightRook = boardState[r][9];
                if (rightRook && rightRook.type === 'rook' && !rightRook.hasMoved) {
                    if (!boardState[r][6] && !boardState[r][7] && !boardState[r][8]) {
                        if (!isSquareAttackedState(boardState, r, 6, opponentColor, lm) &&
                            !isSquareAttackedState(boardState, r, 7, opponentColor, lm) &&
                            !isSquareAttackedState(boardState, r, 8, opponentColor, lm)) {
                            moves.push({ r: r, c: 8, capture: false });
                        }
                    }
                }

                // Enroque Izquierdo
                const leftRook = boardState[r][0];
                if (leftRook && leftRook.type === 'rook' && !leftRook.hasMoved) {
                    if (!boardState[r][1] && !boardState[r][2] && !boardState[r][3] && !boardState[r][4]) {
                        if (!isSquareAttackedState(boardState, r, 1, opponentColor, lm) &&
                            !isSquareAttackedState(boardState, r, 2, opponentColor, lm) &&
                            !isSquareAttackedState(boardState, r, 3, opponentColor, lm) &&
                            !isSquareAttackedState(boardState, r, 4, opponentColor, lm)) {
                            moves.push({ r: r, c: 1, capture: false });
                        }
                    }
                }
            }
        }
    }

    return moves;
}

export function getLegalMovesState(boardState, r, c, lastMoveState = null) {
    const piece = boardState[r][c];
    if (!piece) return [];
    const color = piece.color;
    const raw = getRawMoves(boardState, r, c, false, lastMoveState);
    const legal = [];
    for (const m of raw) {
        const sim = simulateMove(boardState, r, c, m.r, m.c, lastMoveState);
        if (!isKingInCheckState(sim, color)) {
            legal.push(m);
        }
    }
    return legal;
}

export function getLegalMoves(r, c) {
    return getLegalMovesState(board, r, c);
}

function simulateMove(boardState, sr, sc, tr, tc, lastMoveState = null) {
    const sim = boardState.map(row => row.map(p => p ? { ...p } : null));
    const piece = sim[sr][sc];
    sim[tr][tc] = piece;
    sim[sr][sc] = null;

    // Enroque: mover vigía
    if (piece && piece.type === 'king' && Math.abs(tc - sc) > 1) {
        if (tc === 8) {
            sim[tr][7] = sim[tr][9];
            sim[tr][9] = null;
            if (sim[tr][7]) sim[tr][7].hasMoved = true;
        } else if (tc === 1) {
            sim[tr][2] = sim[tr][0];
            sim[tr][0] = null;
            if (sim[tr][2]) sim[tr][2].hasMoved = true;
        }
    }

    // En passant: eliminar peón capturado
    if (lastMoveState && piece && piece.type === 'pawn' &&
        Math.abs(tc - sc) === 1 && !boardState[tr][tc]) {
        const capturedRow = piece.color === 'white' ? tr + 1 : tr - 1;
        if (capturedRow >= 0 && capturedRow < BOARD_SIZE) {
            sim[capturedRow][tc] = null;
        }
    }

    if (piece) piece.hasMoved = true;
    return sim;
}

// 7. ATAQUES, JAQUE, JAQUE MATE, AHOGADO (OPTIMIZADO)
export function isSquareAttackedState(boardState, r, c, byColor, lastMoveState = null) {
    const lm = lastMoveState || lastMove;

    // 1. Peones (ataque diagonal inverso)
    const pawnDir = byColor === 'white' ? -1 : 1;
    const pawnRows = [r - pawnDir, r - pawnDir];
    const pawnCols = [c - 1, c + 1];
    for (let i = 0; i < 2; i++) {
        const pr = pawnRows[i], pc = pawnCols[i];
        if (pr >= 0 && pr < BOARD_SIZE && pc >= 0 && pc < BOARD_SIZE) {
            const p = boardState[pr][pc];
            if (p && p.color === byColor && p.type === 'pawn') return true;
        }
    }

    // 2. Caballo (8 saltos)
    for (const [dr, dc] of MOVEMENT_VECTORS.knight.jumps) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const p = boardState[nr][nc];
            if (p && p.color === byColor && p.type === 'knight') return true;
        }
    }

    // 3. Rey y Paladín base (1 casilla alrededor)
    for (const [dr, dc] of MOVEMENT_VECTORS.king.directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const p = boardState[nr][nc];
            if (p && p.color === byColor && (p.type === 'king' || p.type === 'paladin')) return true;
        }
    }

    // 4. Deslizantes: Torre/Alfil/Queen (ray casting desde objetivo)
    const slideChecks = [
        { dirs: MOVEMENT_VECTORS.rook.directions, types: new Set(['rook', 'queen']) },
        { dirs: MOVEMENT_VECTORS.bishop.directions, types: new Set(['bishop', 'queen']) }
    ];

    for (const { dirs, types } of slideChecks) {
        for (const [dr, dc] of dirs) {
            let dist = 1;
            while (dist < BOARD_SIZE) {
                const nr = r + dr * dist;
                const nc = c + dc * dist;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
                const p = boardState[nr][nc];
                if (p) {
                    if (p.color === byColor && types.has(p.type)) return true;
                    break; // Bloqueado
                }
                dist++;
            }
        }
    }

    // 5. Caballero Imperial (caballo promovido: + ortogonal 1)
    // Nota: verificar caballos promovidos en las 4 ortogonales.
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const p = boardState[nr][nc];
            if (p && p.color === byColor && p.type === 'knight' && p.promoted) return true;
        }
    }

    // 6. General Imperial (paladín promovido: diagonales hasta 2)
    // Nota: Verificar Paladin promovido en diagonales.
    for (const [dr, dc] of MOVEMENT_VECTORS.bishop.directions) {
        for (let dist = 1; dist <= 2; dist++) {
            const nr = r + dr * dist;
            const nc = c + dc * dist;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
            const p = boardState[nr][nc];
            if (p) {
                if (p.color === byColor && p.type === 'paladin' && p.promoted) return true;
                break;
            }
        }
    }

    return false;
}

export function isKingInCheckState(boardState, color, lastMoveState = null) {
    let kr = -1, kc = -1;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = boardState[r][c];
            if (p && p.type === 'king' && p.color === color) {
                kr = r; kc = c; break;
            }
        }
        if (kr !== -1) break;
    }
    if (kr === -1) return false;
    return isSquareAttackedState(boardState, kr, kc, opp(color), lastMoveState);
}

export function isCheckmateState(boardState, color, lastMoveState = null) {
    if (!isKingInCheckState(boardState, color, lastMoveState)) return false;
    return !hasAnyLegalMove(boardState, color, lastMoveState);
}

export function isStalemateState(boardState, color, lastMoveState = null) {
    if (isKingInCheckState(boardState, color, lastMoveState)) return false;
    return !hasAnyLegalMove(boardState, color, lastMoveState);
}

function hasAnyLegalMove(boardState, color, lastMoveState = null) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = boardState[r][c];
            if (p && p.color === color) {
                const legal = getLegalMovesState(boardState, r, c, lastMoveState);
                if (legal.length > 0) return true;
            }
        }
    }
    return false;
}

// 8. TODOS LOS MOVIMIENTOS LEGALES (para CPU)
export function getAllLegalMovesState(boardState, color, lastMoveState = null) {
    const moves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = boardState[r][c];
            if (p && p.color === color) {
                const legal = getLegalMovesState(boardState, r, c, lastMoveState);
                for (const m of legal) {
                    moves.push({
                        from: { r, c },
                        to: { r: m.r, c: m.c },
                        capture: m.capture,
                        pieceType: p.type,
                        enPassant: m.enPassant || false
                    });
                }
            }
        }
    }
    return moves;
}

// 9. UTILIDADES
function inBounds(r, c) {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function opp(color) {
    return color === 'white' ? 'black' : 'white';
}

export function formatMoveNotation(sr, sc, tr, tc, piece, target) {
    const fromCoord = getSquareNotation(sr, sc);
    const toCoord = getSquareNotation(tr, tc);
    const pieceSymbol = getPieceSymbol(piece, sc);
    const actionSymbol = target ? 'X' : '->';
    return `${pieceSymbol}${fromCoord} ${actionSymbol} ${toCoord}`;
}

function updateHistoryUI(notation) {
    const listEl = document.getElementById('move-history-list');
    if (!listEl) return;
    if (notation) moveHistoryText.push(notation);
    listEl.innerHTML = '';
    moveHistoryText.forEach((move, index) => {
        const div = document.createElement('div');
        div.className = "border-b border-[#3e3c39] py-0.5";
        div.innerText = `${index + 1}. ${move}`;
        listEl.appendChild(div);
    });
    listEl.scrollTop = listEl.scrollHeight;
}

export function setCpuThinking(val) {
    cpuThinking = val;
}

// 10. EXPORTS
export {
    board,
    turn,
    capturedPawns,
    gameMode,
    cpuThinking,
    lastMove,
    selectedPiece,
    validMoves
};
