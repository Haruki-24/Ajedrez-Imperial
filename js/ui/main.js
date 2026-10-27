// js/ui/main.js — Orquestador de UI y Estado (Ajedrez Imperial)
// Mantiene el estado de la partida y controla los eventos.

import { saveState, loadState, clearState } from './storage.js';

import {
    initRender, renderBoard, updateUI, showMessage,
    pickRandomScenario, restoreScenario, getCurrentScenario,
    getColorTheme, getPieceTheme, getPerspective, getShowCoords,
    setColorTheme, setPieceTheme, setPerspective, toggleCoords
} from './render.js';

import {
    createInitialBoard,
    getLegalMovesState,
    getRawMoves,
    isKingInCheckState,
    isCheckmateState,
    isStalemateState,
    formatMoveNotation
} from '../core/game.js';

import { createCPU } from '../core/cpu.js';
import { switchLanguage, updateTurnText } from './translate.js';
import { BOARD_SIZE } from '../core/constants.js';
import { PIECE_THEMES } from '../core/constants-scenes.js';

// ============================================================
// ESTADO GLOBAL DE LA PARTIDA (Gestionado por la UI)
// ============================================================
let board = [];
let turn = 'white';
let selectedPiece = null;
let validMoves = [];
let lastMove = null;
let moveHistory = [];       // Stack de estados para undo
let capturedPawns = { white: 0, black: 0 };
let capturedMaterial = { white: 0, black: 0 };
let gameMode = 'pvc';
let cpuThinking = false;
let cpuDifficulty = 'medio';

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    try {
        initRender(onSquareClick);
        bindUIEvents();
        switchLanguage('es');

        // si hay sesión guardada, la restauramos.
        const saved = loadState();
        if (saved) {
            hydrate(saved);
            console.log('✅ Sesión restaurada');
        } else {
            startNewSession();
            console.log('✅ Nueva sesión iniciada');
        }

        console.log('✅ Ajedrez Imperial inicializado');
    } catch (err) {
        console.error('Error inicializando el juego:', err);
    }
});

// ============================================================
// CONTROL DE PARTIDA
// ============================================================
/* Sesión NUEVA: resetea estado, limpia storage, y sortea escenario. */
function startNewSession() {
    clearState();
    resetGameState();
    pickRandomScenario();
    updateAllUI();
    showMessage('¡Partida iniciada!');
    persist();
}

/* Resetea únicamente las variables de estado (sin tocar storage ni escenario). */
function resetGameState() {
    board = createInitialBoard();
    turn = 'white';
    selectedPiece = null;
    validMoves = [];
    lastMove = null;
    capturedPawns = { white: 0, black: 0 };
    capturedMaterial = { white: 0, black: 0 };
    moveHistory = [];
    cpuThinking = false;

    const cpuSelect = document.getElementById('cpu-level');
    if (cpuSelect) cpuSelect.disabled = false;
}

function resetGame() {
    startNewSession();
}

function changeGameMode(mode) {
    gameMode = mode;
    // Cambiar de modo equivale a una partida nueva.
    startNewSession();
}

// ============================================================
// PERSISTENCIA
// ============================================================

function snapshot() {
    return {
        board,
        turn,
        selectedPiece,
        validMoves,
        lastMove,
        capturedPawns,
        capturedMaterial,
        moveHistory,
        gameMode,
        cpuDifficulty,
        colorTheme:  getColorTheme(),
        pieceTheme:  getPieceTheme(),
        perspective: getPerspective(),
        showCoords:  getShowCoords(),
        scenario:    getCurrentScenario()
    };
}

/** Persiste el snapshot (debounce interno en storage.js). */
function persist() {
    saveState(snapshot());
}

/* Reconstruye el estado desde respeta el guardado. */
function hydrate(saved) {
    board           = saved.board;
    turn            = saved.turn ?? 'white';
    selectedPiece   = saved.selectedPiece ?? null;
    validMoves      = Array.isArray(saved.validMoves) ? saved.validMoves : [];
    lastMove        = saved.lastMove ?? null;
    capturedPawns   = saved.capturedPawns ?? { white: 0, black: 0 };
    capturedMaterial= saved.capturedMaterial ?? { white: 0, black: 0 };
    moveHistory     = Array.isArray(saved.moveHistory) ? saved.moveHistory : [];
    gameMode        = saved.gameMode ?? 'pvc';
    cpuDifficulty   = saved.cpuDifficulty ?? 'medio';
    cpuThinking     = false;

    // Aplicar tema/escenario guardados.
    if (saved.colorTheme)  setColorTheme(saved.colorTheme);
    if (saved.pieceTheme)  setPieceTheme(saved.pieceTheme);
    if (saved.perspective) setPerspective(saved.perspective);
    if (saved.showCoords !== getShowCoords()) toggleCoords();
    if (saved.scenario)    restoreScenario(saved.scenario);
    else                   pickRandomScenario();

    // Sincronizar controles del DOM con el estado restaurado.
    const cpuSelect = document.getElementById('cpu-level');
    if (cpuSelect) {
        cpuSelect.value = cpuDifficulty;
        cpuSelect.disabled = (turn !== 'white' && gameMode === 'pvc');
    }
    const modeSelect = document.getElementById('game-mode');
    if (modeSelect) modeSelect.value = gameMode;

    updateAllUI();
}

// ============================================================
// INTERACCIÓN CON EL TABLERO
// ============================================================
function onSquareClick(r, c) {
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
        validMoves = getLegalMovesState(board, r, c, lastMove);
    } else {
        selectedPiece = null;
        validMoves = [];
    }

    updateAllUI();
    persist();
}

// ============================================================
// EJECUCIÓN DE MOVIMIENTOS (Lógica de UI)
// ============================================================
function executeMove(sr, sc, tr, tc) {
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
        capturedMaterial: { ...capturedMaterial },
        lastMove: lastMove ? { from: { ...lastMove.from }, to: { ...lastMove.to }, pieceType: lastMove.pieceType } : null
    };
    moveHistory.push(state);

    // --- CAPTURAS ---
    if (target) {
        if (target.type === 'king') {
            board[tr][tc] = piece;
            board[sr][sc] = null;
            lastMove = { from: { r: sr, c: sc }, to: { r: tr, c: tc }, pieceType: piece.type };
            showMessage(`¡Ganan las ${turn === 'white' ? 'Blancas' : 'Negras'}!`, -1);
            turn = 'none';
            updateAllUI();
            persist();
            return;
        }

        if (target.type === 'pawn') {
            capturedPawns[piece.color]++;
            capturedMaterial[piece.color] += 100;

            if (piece.type === 'rook' || piece.type === 'bishop') {
                if (!piece.promoted) {
                    piece.kills = (piece.kills || 0) + 1;
                    if (piece.kills >= 3) {
                        piece.promoted = true;
                        piece.kills = 0;
                        const name = piece.type === 'rook' ? 'Torre de Asedio' : 'Alfil Celestial';
                        message = `¡${name} ascendido!`;
                    } else {
                        message = `Peón capturado (${piece.kills}/3)`;
                    }
                }
            }
        }
    }

    // --- EN PASSANT ---
    if (!target && piece.type === 'pawn' && Math.abs(tc - sc) === 1) {
        const capturedRow = piece.color === 'white' ? tr + 1 : tr - 1;
        const capturedPawn = board[capturedRow][tc];
        if (capturedPawn && capturedPawn.type === 'pawn' && capturedPawn.color !== piece.color) {
            board[capturedRow][tc] = null;
            capturedPawns[piece.color]++;
            capturedMaterial[piece.color] += 100;
        }
    }

    // --- PROMOCIÓN REINA ---
    if (!piece.promoted && piece.type === 'queen' && (target || (!target && piece.type === 'pawn' && Math.abs(tc - sc) === 1))) {
        piece.promoted = true;
        message = "¡Reina ascendida a Emperatriz!";
    }

    // --- ENROQUE ---
    if (piece.type === 'king' && Math.abs(tc - sc) > 1) {
        if (tc === 8) {
            board[tr][7] = board[tr][9];
            board[tr][9] = null;
            board[tr][7].hasMoved = true;
            message = "Enroque Imperial (Flanco Este)";
        } else if (tc === 1) {
            board[tr][2] = board[tr][0];
            board[tr][0] = null;
            board[tr][2].hasMoved = true;
            message = "Enroque Imperial (Flanco Oeste)";
        }
    }

    // --- MOVER PIEZA ---
    const notation = formatMoveNotation(sr, sc, tr, tc, piece, target);
    board[tr][tc] = piece;
    board[sr][sc] = null;
    piece.hasMoved = true;
    lastMove = { from: { r: sr, c: sc }, to: { r: tr, c: tc }, pieceType: piece.type };

    // --- PROMOCIÓN POR TERRITORIO ---
    if (!piece.promoted && (piece.type === 'pawn' || piece.type === 'knight' || piece.type === 'paladin')) {
        const inZone = (piece.color === 'white' && tr <= 1) || (piece.color === 'black' && tr >= 8);
        if (inZone) {
            piece.promoted = true;
            const names = { pawn: 'Sargento', knight: 'Caballero Imperial', paladin: 'General Real' };
            message = `¡${names[piece.type]} ascendido por territorio!`;
        }
    }

    if (message) showMessage(message);
}

function undoMove() {
    if (moveHistory.length === 0) {
        showMessage('No hay movimientos para deshacer');
        return;
    }
    const state = moveHistory.pop();
    board = state.board;
    turn = state.turn;
    capturedPawns = state.capturedPawns;
    capturedMaterial = state.capturedMaterial || { white: 0, black: 0 };
    lastMove = state.lastMove;
    selectedPiece = null;
    validMoves = [];

    updateAllUI();
    showMessage('Movimiento deshecho');
    persist();
}

function switchTurn() {
    if (turn === 'none') return;
    turn = turn === 'white' ? 'black' : 'white';

    const nextColor = turn;

    // Verificar fin del juego
    if (isCheckmateState(board, nextColor, lastMove)) {
        const winner = nextColor === 'white' ? 'black' : 'white';
        showMessage(`¡Jaque Mate! Ganan las ${winner === 'white' ? 'Blancas' : 'Negras'}`, -1);
        turn = 'none';
    } else if (isStalemateState(board, nextColor, lastMove)) {
        showMessage('¡Tablas por ahogado!', -1);
        turn = 'none';
    } else if (isKingInCheckState(board, nextColor, lastMove)) {
        showMessage(`¡Jaque a las ${nextColor === 'white' ? 'Blancas' : 'Negras'}!`);
    }

    updateAllUI();
    persist();

    // Si es turno de la CPU, activarla
    if (gameMode === 'pvc' && turn === 'black' && turn !== 'none' && !cpuThinking) {
        triggerCpuTurn();
    }
}

// ============================================================
// TURNO CPU
// ============================================================
function triggerCpuTurn() {
    cpuThinking = true;
    updateAllUI();
    persist(); // persistimos cpuThinking=true por si el usuario recarga a mitad

    setTimeout(() => {
        try {
            const cpu = createCPU(cpuDifficulty);
            const move = cpu.getBestMove(board, 'black', capturedPawns, lastMove);

            if (move) {
                executeMove(move.from.r, move.from.c, move.to.r, move.to.c);
                if (turn !== 'none') switchTurn();
            } else {
                showMessage('La CPU no encuentra movimiento. ¡Tablas!', -1);
            }
        } catch (err) {
            console.error('Error en CPU:', err);
            showMessage('Error del motor CPU.');
        } finally {
            cpuThinking = false;
            updateAllUI();
            persist();
        }
    }, 400);
}

// ============================================================
// RENDERIZADO Y ACTUALIZACIÓN DE UI
// ============================================================
function updateAllUI() {
    const gameState = {
        board,
        selectedPiece,
        validMoves,
        lastMove,
        turn,
        kingPositions: getKingPositions(),
        isCheck: isKingInCheckState(board, turn, lastMove)
    };

    renderBoard(gameState);
    updateTurnText(turn);
    updateUI(turn, capturedPawns);
}

function getKingPositions() {
    const positions = { white: null, black: null };
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.type === 'king') {
                positions[p.color] = { r, c };
            }
        }
    }
    return positions;
}

// ============================================================
// EVENTOS DE UI
// ============================================================
function bindUIEvents() {
    const safeAdd = (id, event, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
        else console.warn(`[main.js] Elemento #${id} no encontrado`);
    };

    safeAdd('btn-new-game', 'click', () => resetGame());
    safeAdd('btn-undo', 'click', () => undoMove());

    safeAdd('btn-coords', 'click', () => {
        toggleCoords();
        const btn = document.getElementById('btn-coords');
        if (btn) {
            const isActive = getShowCoords();
            btn.classList.toggle('bg-yellow-600', isActive);
            btn.classList.toggle('hover:bg-yellow-700', isActive);
            btn.classList.toggle('bg-[#4b4843]', !isActive);
            btn.classList.toggle('hover:bg-[#5c5852]', !isActive);
        }
        updateAllUI();
        persist();
    });

    safeAdd('lang-selector', 'change', (e) => {
        switchLanguage(e.target.value);
        updateTurnText(turn);
    });

    safeAdd('game-mode', 'change', (e) => {
        changeGameMode(e.target.value);
    });

    safeAdd('cpu-level', 'change', (e) => {
        cpuDifficulty = e.target.value;
        persist();
    });

    safeAdd('color-theme', 'change', (e) => {
        setColorTheme(e.target.value);
        updateAllUI();
        persist();
    });

    safeAdd('piece-theme', 'change', (e) => {
        const themeName = e.target.value;
        setPieceTheme(themeName);
        const themeData = PIECE_THEMES[themeName];
        if (themeData && themeData.perspective) {
            const perspectiveSelect = document.getElementById('perspective');
            if (perspectiveSelect) {
                perspectiveSelect.value = themeData.perspective;
                setPerspective(themeData.perspective);
            }
        }
        updateAllUI();
        persist();
    });

    safeAdd('perspective', 'change', (e) => {
        setPerspective(e.target.value);
        updateAllUI();
        persist();
    });

    console.log('[main.js] Eventos UI conectados');
}