/**
 * constants.js
 * Módulo centralizado de constantes para Ajedrez Imperial 10x10
 * Arquitectura ES6 - Temas: Classic | Chibi/FF
 * 
 * Estructura del repositorio:
 *   assets/docs/     → Documentos PDF
 *   assets/icons/    → Iconos de piezas (classic)
 *   assets/img/      → Imágenes generales / fondos / portadas
 *   assets/chibi/    → Sprites chibi/FF (preparado)
 *   jscripts/        → Módulos JS
 *   styles/          → CSS
 *   index.html       → Raíz
 */

// ============================================================
// 1. CONFIGURACIÓN DEL TABLERO
// ============================================================
export const BOARD_SIZE = 10;

// Filas de promoción por territorio (últimas 2 filas enemigas)
export const PROMOTION_ZONE = {
    white: { maxRow: 1 },  // filas 0 y 1
    black: { minRow: 8 }   // filas 8 y 9
};

// ============================================================
// 2. DEFINICIÓN DE PIEZAS
//    Mapeo tipo-interno → nombres de archivo e información
// ============================================================
export const PIECES = {
    pawn:     { base: 'peon',      promoted: 'sargento',      nameES: 'Peón',      nameEN: 'Pawn' },
    rook:     { base: 'vigia',     promoted: 'torre',         nameES: 'Vigía',     nameEN: 'Lookout' },
    knight:   { base: 'caballo',   promoted: 'caballero',     nameES: 'Caballo',   nameEN: 'Knight' },
    bishop:   { base: 'escudero',  promoted: 'alfil',         nameES: 'Escudero',  nameEN: 'Squire' },
    paladin:  { base: 'paladin',   promoted: 'general_real',  nameES: 'Paladín',   nameEN: 'Paladin' },
    queen:    { base: 'reina',     promoted: 'emperatriz',    nameES: 'Reina',     nameEN: 'Queen' },
    king:     { base: 'emperador', promoted: 'emperador',     nameES: 'Emperador', nameEN: 'Emperor' }
};

// Piezas que pueden ascender por captura de peones
export const PAWN_KILLERS = ['bishop', 'rook'];

// Piezas que pueden ascender por territorio
export const ZONE_PROMOTABLES = ['pawn', 'knight', 'paladin'];

// Capturas necesarias para ascender (Vigía/Escudero)
export const KILLS_TO_PROMOTE = 3;

// ============================================================
// 3. TEMAS DE COLOR DEL TABLERO
// ============================================================
export const COLOR_THEMES = {
    classic: {
        light: '#f0d9b5',
        dark: '#b58863',
        lightHighlight: '#f6f669',
        darkHighlight: '#f6f669',
        lastMoveLight: '#cdd26a',
        lastMoveDark: '#aaa23b',
        check: '#ff0000',
        label: 'Clásico'
    },
    green: {
        light: '#e8edb3',
        dark: '#85a56a',
        lightHighlight: '#ffff99',
        darkHighlight: '#ffff99',
        lastMoveLight: '#b8c97a',
        lastMoveDark: '#7a8f5a',
        check: '#ff0000',
        label: 'Verde'
    },
    wood: {
        light: '#deb887',
        dark: '#8b5a2b',
        lightHighlight: '#f0d58c',
        darkHighlight: '#c9a84c',
        lastMoveLight: '#d4a86a',
        lastMoveDark: '#a67c4a',
        check: '#ff0000',
        label: 'Madera'
    },
    dark: {
        light: '#4a4a4a',
        dark: '#2a2a2a',
        lightHighlight: '#6a6a6a',
        darkHighlight: '#4a4a4a',
        lastMoveLight: '#5a5a5a',
        lastMoveDark: '#3a3a3a',
        check: '#ff4444',
        label: 'Oscuro'
    },
    // Nuevo: tema Final Fantasy (preparado)
    ff_crystal: {
        light: '#e0f7fa',
        dark: '#006064',
        lightHighlight: '#b2ebf2',
        darkHighlight: '#00838f',
        lastMoveLight: '#80deea',
        lastMoveDark: '#0097a7',
        check: '#d50000',
        label: 'FF Cristal'
    }
};

// ============================================================
// 4. TEMAS DE PIEZAS (rutas relativas a index.html)
// ============================================================
const PATHS = {
    classic: 'assets/icons/',
    chibi:   'assets/chibi/'   // preparado para sprites FF/chibi
};

export const PIECE_THEMES = {
    // --- Tema Clásico (piezas actuales) ---
    classic: {
        label: 'Clásico',
        perspective: '2d',
        white: {
            peon:         PATHS.classic + 'b-peon-b.png',
            sargento:     PATHS.classic + 'b-sargento.png',
            vigia:        PATHS.classic + 'b-vigia.png',
            torre:        PATHS.classic + 'b-torre.png',
            caballo:      PATHS.classic + 'b-caballo.png',
            caballero:    PATHS.classic + 'b-caballero.png',
            escudero:     PATHS.classic + 'b-escudero.png',
            alfil:        PATHS.classic + 'b-alfil.png',
            paladin:      PATHS.classic + 'b-paladin.png',
            general_real: PATHS.classic + 'b-general-real.png',
            reina:        PATHS.classic + 'b-reina.png',
            emperatriz:   PATHS.classic + 'b-emperatriz.png',
            emperador:    PATHS.classic + 'b-emperador.png'
        },
        black: {
            peon:         PATHS.classic + 'n-peon.png',
            sargento:     PATHS.classic + 'n-sargento.png',
            vigia:        PATHS.classic + 'n-vigia.png',
            torre:        PATHS.classic + 'n-torre.png',
            caballo:      PATHS.classic + 'n-caballo.png',
            caballero:    PATHS.classic + 'n-caballero.png',
            escudero:     PATHS.classic + 'n-escudero.png',
            alfil:        PATHS.classic + 'n-alfil.png',
            paladin:      PATHS.classic + 'n-paladin.png',
            general_real: PATHS.classic + 'n-general-real.png',
            reina:        PATHS.classic + 'n-reina.png',
            emperatriz:   PATHS.classic + 'n-emperatriz.png',
            emperador:    PATHS.classic + 'n-emperador.png'
        }
    },

    // --- Tema Chibi / Final Fantasy (preparado) ---
    chibi: {
        label: 'Chibi FF',
        perspective: '2.5d',
        white: {
            peon:         PATHS.chibi + 'w-peon-chibi-128.png',
            sargento:     PATHS.chibi + 'w-sargento-chibi-128.png',
            vigia:        PATHS.chibi + 'w-vigia-chibi-128.png',
            torre:        PATHS.chibi + 'w-torre-chibi-128.png',
            caballo:      PATHS.chibi + 'w-caballo-chibi-128.png',
            caballero:    PATHS.chibi + 'w-caballero-chibi-128.png',
            escudero:     PATHS.chibi + 'w-escudero-chibi-128.png',
            alfil:        PATHS.chibi + 'w-alfil-chibi-128.png',
            paladin:      PATHS.chibi + 'w-paladin-chibi-128.png',
            general_real: PATHS.chibi + 'w-general-chibi-128.png',
            reina:        PATHS.chibi + 'w-reina-chibi-128.png',
            emperatriz:   PATHS.chibi + 'w-emperatriz-chibi-128.png',
            emperador:    PATHS.chibi + 'w-emperador-chibi-128.png'
        },
        black: {
            peon:         PATHS.chibi + 'b-peon-chibi-128.png',
            sargento:     PATHS.chibi + 'b-sargento-chibi-128.png',
            vigia:        PATHS.chibi + 'b-vigia-chibi-128.png',
            torre:        PATHS.chibi + 'b-torre-chibi-128.png',
            caballo:      PATHS.chibi + 'b-caballo-chibi-128.png',
            caballero:    PATHS.chibi + 'b-caballero-chibi-128.png',
            escudero:     PATHS.chibi + 'b-escudero-chibi-128.png',
            alfil:        PATHS.chibi + 'b-alfil-chibi-128.png',
            paladin:      PATHS.chibi + 'b-paladin-chibi-128.png',
            general_real: PATHS.chibi + 'b-general-chibi-128.png',
            reina:        PATHS.chibi + 'b-reina-chibi-128.png',
            emperatriz:   PATHS.chibi + 'b-emperatriz-chibi-128.png',
            emperador:    PATHS.chibi + 'b-emperador-chibi-128.png'
        }
    }
};

// ============================================================
// 5. CONFIGURACIÓN CPU (dificultades)
// ============================================================
export const CPU_DIFFICULTY = {
    facil:    { timeLimit: 300,  depthLimit: 2, randomness: 0.35, label: 'Fácil' },
    medio:    { timeLimit: 800,  depthLimit: 3, randomness: 0.15, label: 'Medio' },
    dificil:  { timeLimit: 2500, depthLimit: 4, randomness: 0.05, label: 'Difícil' },
    maestro:  { timeLimit: 5000, depthLimit: 6, randomness: 0.00, label: 'Maestro' }
};

// ============================================================
// 6. VALORES DE PIEZAS PARA EVALUACIÓN (motor CPU)
//    Usa SIEMPRE los tipos base; el bonus por promoción
//    se aplica dinámicamente en la evaluación.
// ============================================================
export const PIECE_VALUES = {
    pawn:     100,
    knight:   350,
    bishop:   250,
    rook:     400,
    paladin:  450,
    queen:    600,
    king:     10000
};

// Bonus aplicados cuando una pieza está promocionada
export const PROMOTION_BONUS = {
    pawn:    180,   // Sargento
    knight:  200,   // Caballero Imperial
    bishop:  80,    // Alfil
    rook:    100,   // Torre
    paladin: 250,   // General Real
    queen:   1400,  // Emperatriz (gran salto)
    king:    0
};

// Bonus posicional
export const POSITION_BONUS = {
    center: 15,           // casillas centrales (3-6, 3-6)
    pawnAdvance: 5,       // por fila de avance
    knightCenter: 10,     // caballo/paladin no promocionado en centro
    queenActivity: 40,    // reina que ya se ha movido
    queenSafe: 50,        // reina segura (no amenazada)
    queenEscape: -200,    // reina amenazada pero puede escapar
    queenTrapped: -3000,  // reina en jaque sin escapatoria
    pawnKillProgress: 30  // por cada peón capturado acumulado
};

// ============================================================
// 7. TRADUCCIONES (centralizadas)
// ============================================================
export const TRANSLATIONS = {
    es: {
        title: "Ajedrez Imperial",
        subtitle: "Tablero 10x10. Mecánicas de ascenso de clases.",
        turnLabel: "Turno:",
        whiteText: "Blancas",
        blackText: "Negras",
        modeLabel: "Modo de Juego",
        optPvp: "2 Jugadores (Local)",
        optPvc: "1 Jugador vs CPU",
        diffLabel: "Dificultad CPU",
        diffEasy: "Fácil",
        diffMed: "Medio",
        diffHard: "Difícil",
        diffMaster: "Maestro",
        newGame: "Nueva Partida",
        toolsLabel: "Herramientas / Práctica",
        undo: "↩ Deshacer",
        coords: "(x;y) Coordenadas",
        historyLabel: "Historial Imperial",
        legendLabel: "Leyenda de Piezas",
        legend: {
            pawn: "Peón / Sargento",
            rook: "Vigía / Torre",
            knight: "Caballo / C. Imperial",
            paladin: "Paladín / G. Imperial",
            bishop: "Escudero / Alfil",
            queen: "Reina / Emperatriz",
            emperor: "Emperador"
        },
        rules: {
            title: "Reglas del Juego",
            objCheckmate: "* El objetivo es dar Jaque Mate al Emperador.",
            promotionGeneral: "* Las piezas ascienden capturando piezas o avanzando al territorio rival.",
            captureAscentTitle: "Ascenso por captura:",
            captureVigia: "- Vigía/Escudero → 3 peones.",
            captureQueen: "- Reina → 1 pieza cualquiera.",
            zoneAscentTitle: "Ascenso por zona: al llegar a últimas 2 filas enemigas, Peón/Caballo/Paladín",
            castlingRule: "* Enroque imperial: se intercambian posiciones entre Emperador y Vigía, similar al enroque en ajedrez.",
            castlingCondTitle: "Condiciones Enroque Imperial:",
            condFlank: "- Limpieza de flanco",
            condMobility: "- Inmovilidad previa de Vigía y Emperador",
            condSafe: "- Casillas seguras.",
            manualPreText: "Accede al reglamento oficial ",
            manualLinkText: "aquí",
            manualFile: "assets/docs/reglamento-ajedrez-imperial-es.pdf"
        },
        messages: {
            gameStarted: "¡Partida iniciada!",
            gameReset: "Partida reiniciada.",
            undoDone: "Movimiento deshecho.",
            noUndo: "No hay movimientos para deshacer.",
            check: (color) => `¡Jaque al Emperador ${color === 'white' ? 'Blanco' : 'Negro'}!`,
            checkmate: (winner) => `¡Jaque Mate! Ganan las ${winner === 'white' ? 'Blancas' : 'Negras'}.`,
            stalemate: "¡Tablas por ahogado!",
            cpuNoMove: "La CPU no encuentra movimiento. ¡Tablas!",
            pawnCaptured: (color, kills) => `¡Peón capturado! Exp: ${kills}/3★`,
            promotePawnKill: (name) => `¡Ascenso! ${name}`,
            promoteQueen: "¡La Reina asciende a Emperatriz!",
            promoteZone: (name) => `¡${name} promovido por territorio!`,
            castleRight: "¡Enroque Imperial Flanco Derecho!",
            castleLeft: "¡Enroque Imperial Flanco Izquierdo!"
        }
    },
    en: {
        title: "Imperial Chess",
        subtitle: "10x10 Board. Class promotion mechanics.",
        turnLabel: "Turn:",
        whiteText: "White",
        blackText: "Black",
        modeLabel: "Game Mode",
        optPvp: "2 Players (Local)",
        optPvc: "1 Player vs CPU",
        diffLabel: "CPU Difficulty",
        diffEasy: "Easy",
        diffMed: "Medium",
        diffHard: "Hard",
        diffMaster: "Master",
        newGame: "New Game",
        toolsLabel: "Tools / Practice",
        undo: "↩ Undo",
        coords: "(x;y) Coordinates",
        historyLabel: "Imperial History",
        legendLabel: "Pieces Legend",
        legend: {
            pawn: "Pawn / Sergeant",
            rook: "Lookout / Rook",
            knight: "Knight / Imperial Knight",
            paladin: "Paladin / Imperial General",
            bishop: "Squire / Bishop",
            queen: "Queen / Empress",
            emperor: "Emperor"
        },
        rules: {
            title: "Game Rules",
            objCheckmate: "* The objective is to checkmate the Emperor.",
            promotionGeneral: "* Pieces promote by capturing pieces or advancing into enemy territory.",
            captureAscentTitle: "Promotion by capture:",
            captureVigia: "- Lookout/Squire → 3 pawns.",
            captureQueen: "- Queen → Any 1 piece.",
            zoneAscentTitle: "Zone promotion: upon reaching the last 2 enemy rows, Pawn/Knight/Paladin",
            castlingRule: "* Imperial Castling swaps positions between the Emperor and the Lookout, similar to castling in chess.",
            castlingCondTitle: "Imperial Castling Conditions:",
            condFlank: "- Flank clearance",
            condMobility: "- Prior immobility of Lookout and Emperor",
            condSafe: "- Safe squares.",
            manualPreText: "Access the official rulebook ",
            manualLinkText: "here",
            manualFile: "assets/docs/official-rulebook-imperial-chess-en.pdf"
        },
        messages: {
            gameStarted: "Game started!",
            gameReset: "Game reset.",
            undoDone: "Move undone.",
            noUndo: "No moves to undo.",
            check: (color) => `Check to the ${color === 'white' ? 'White' : 'Black'} Emperor!`,
            checkmate: (winner) => `Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins.`,
            stalemate: "Stalemate!",
            cpuNoMove: "CPU cannot find a move. Draw!",
            pawnCaptured: (color, kills) => `Pawn captured! Exp: ${kills}/3★`,
            promotePawnKill: (name) => `Promotion! ${name}`,
            promoteQueen: "The Queen ascends to Empress!",
            promoteZone: (name) => `${name} promoted by territory!`,
            castleRight: "Imperial Castling Right Flank!",
            castleLeft: "Imperial Castling Left Flank!"
        }
    }
};

// ============================================================
// 8. CONFIGURACIÓN DE MOVIMIENTOS (vectores por pieza)
// ============================================================
export const MOVEMENT_VECTORS = {
    // Peón: avanza 1, captura diagonal 1
    pawn: {
        white: { advance: [[-1, 0]], capture: [[-1, -1], [-1, 1]], start: [[-2, 0]] },
        black: { advance: [[1, 0]],  capture: [[1, -1], [1, 1]],  start: [[2, 0]] }
    },
    // Vigía/Torre: ortogonal cualquier distancia
    rook: { directions: [[0,1],[0,-1],[1,0],[-1,0]], slide: true },
    // Caballo/Caballero: salto en L
    knight: { jumps: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], slide: false },
    // Escudero/Alfil: diagonal cualquier distancia
    bishop: { directions: [[1,1],[1,-1],[-1,1],[-1,-1]], slide: true },
    // Paladín/General Real: ortogonal + diagonal (rey potenciado)
    paladin: { directions: [
        [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]
    ], slide: false },
    // Reina/Emperatriz: ortogonal + diagonal cualquier distancia
    queen: { directions: [
        [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]
    ], slide: true },
    // Emperador: 1 casilla cualquier dirección
    king: { directions: [
        [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]
    ], slide: false }
};

// ============================================================
// 9. POSICIONES INICIALES (back row 10x10)
// ============================================================
export const STARTING_BACK_ROW = [
    'rook', 'knight', 'bishop', 'paladin', 'queen',
    'king',
    'paladin', 'bishop', 'knight', 'rook'
];

// ============================================================
// 10. AYUDAS DE FORMATO
// ============================================================

/**
 * Obtiene la ruta de imagen para una pieza según su tema
 * @param {Object} piece - { type, color, promoted }
 * @param {Object} theme - objeto de PIECE_THEMES[themeName]
 */
export function getPieceImagePath(piece, theme) {
    const key = piece.promoted ? PIECES[piece.type].promoted : PIECES[piece.type].base;
    return theme[piece.color][key] || '';
}

/**
 * Notación de casilla personalizada del Ajedrez Imperial
 * Ej: 5N5E, 3N2O, 1S1E
 */
export function getSquareNotation(r, c) {
    const yNum = (r < 5) ? 5 - r : r - 4;
    const yDir = (r < 5) ? 'N' : 'S';
    const xNum = (c < 5) ? 5 - c : c - 4;
    const xDir = (c < 5) ? 'O' : 'E';
    if (yNum === xNum) return `${yNum}${yDir}${xDir}`;
    return `${yNum}${yDir}${xNum}${xDir}`;
}

/**
 * Símbolo de pieza para notación Imperial
 * @param {Object} piece — { type, promoted }
 * @param {number} c — columna (determina orientación E/O)
 */
export function getPieceSymbol(piece, c) {
    if (!piece) return '';
    const isEast = c >= 5;
    switch (piece.type) {
        case 'pawn':    return piece.promoted ? 'S' : 'x';
        case 'rook':    return piece.promoted ? 'T' : (isEast ? 'Ve' : 'Vo');
        case 'bishop':  return piece.promoted ? (isEast ? 'Ae' : 'Ao') : (isEast ? 'Ee' : 'Eo');
        case 'knight':  return piece.promoted ? 'Cr' : 'C';
        case 'paladin': return piece.promoted ? 'G' : 'P';
        case 'queen':   return piece.promoted ? 'Q' : 'R';
        case 'king':    return 'K';
        default:        return '';
    }
}