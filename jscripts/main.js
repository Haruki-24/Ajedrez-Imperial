// main.js — Orquestador principal Ajedrez Imperial 10x10
// Arquitectura ES6. Compatible con game.js legacy.

import {
    initRender, renderBoard, setColorTheme, setPieceTheme, setPerspective, toggleCoords, showMessage, getShowCoords
} from './render.js';

import {
    resetGame, changeGameMode, undoMove, handleSquareClick, getGameState,
    executeMove, switchTurn, board, turn, gameMode, cpuThinking, setCpuThinking, capturedPawns
} from './game.js';

import { createCPU } from './cpu.js';
import { switchLanguage, updateTurnText } from './translate.js';
import { PIECE_THEMES } from './constants.js';


/* Configuracion global */

window.cpuDifficulty = 'medio';
window.switchLanguage = switchLanguage;


/* Inicialización */


document.addEventListener('DOMContentLoaded', () => {
    try {
        initRender(onSquareClick);
        bindUIEvents();
        switchLanguage('es');
        resetGame();
        console.log(' Ajedrez Imperial inicializado [ES6 Modular]');
    } catch (err) {
        console.error('Error inicializando el juego:', err);
    }
});


/* Click en tablero */


function onSquareClick(r, c) {
    try {
        handleSquareClick(r, c);
        if (gameMode === 'pvc' && turn === 'black' && turn !== 'none' && !cpuThinking) {
            triggerCpuTurn();
        }
    } catch (err) {
        console.error('Error en onSquareClick:', err);
    }
}


/* TURNO CPU */


function triggerCpuTurn() {
    setCpuThinking(true);
    setTimeout(() => {
        try {
            const difficulty = window.cpuDifficulty || 'medio';
            const cpu = createCPU(difficulty);
            const move = cpu.getBestMove(board, 'black', capturedPawns);
            if (move) {
                executeMove(move.from.r, move.from.c, move.to.r, move.to.c);
                if (turn !== 'none') switchTurn();
            } else {
                showMessage('La CPU no encuentra movimiento. ¡Tablas!', -1);
            }
        } catch (err) {
            console.error('Error en CPU:', err);
            showMessage('Error del motor CPU.', 3000);
        } finally {
            setCpuThinking(false);
        }
    }, 400);
}


// EVENTOS UI


function bindUIEvents() {
    const safeAdd = (id, event, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
        else console.warn(`[main.js] Elemento #${id} no encontrado`);
    };

    safeAdd('btn-new-game', 'click', () => resetGame());
    safeAdd('btn-undo', 'click', () => undoMove());

    // Botón de coordenadas con feedback visual
    safeAdd('btn-coords', 'click', () => {
        toggleCoords();
        const btn = document.getElementById('btn-coords');
        if (btn) {
            const isActive = getShowCoords();
            if (isActive) {
                btn.classList.remove('bg-[#4b4843]', 'hover:bg-[#5c5852]');
                btn.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
            } else {
                btn.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
                btn.classList.add('bg-[#4b4843]', 'hover:bg-[#5c5852]');
            }
        }
        safeRender();
    });

    safeAdd('lang-selector', 'change', (e) => {
        switchLanguage(e.target.value);
        updateTurnText(turn);
    });

    safeAdd('game-mode', 'change', (e) => {
        changeGameMode(e.target.value);
    });

    safeAdd('cpu-level', 'change', (e) => {
        window.cpuDifficulty = e.target.value;
    });

    safeAdd('color-theme', 'change', (e) => {
        setColorTheme(e.target.value);
        safeRender();
    });

    // Tema de piezas: sincroniza perspectiva automáticamente
    safeAdd('piece-theme', 'change', (e) => {
        const themeName = e.target.value;
        setPieceTheme(themeName);

        // Si el tema define una perspectiva preferida, la sincronizamos
        const themeData = PIECE_THEMES[themeName];
        if (themeData && themeData.perspective) {
            const perspectiveSelect = document.getElementById('perspective');
            if (perspectiveSelect) {
                perspectiveSelect.value = themeData.perspective;
                setPerspective(themeData.perspective);
            }
        }

        safeRender();
    });

    safeAdd('perspective', 'change', (e) => {
        setPerspective(e.target.value);
        safeRender();
    });

    console.log('[main.js] Eventos UI conectados');
}

// Helper defensivo para re-renderizar
function safeRender() {
    try {
        const gs = (typeof getGameState === 'function') ? getGameState() : null;
        if (gs) renderBoard(gs);
    } catch (e) {
        console.error('[main.js] Error en safeRender:', e);
    }
}
