// translate.js — Sistema de internacionalización Ajedrez Imperial 10x10
// Arquitectura ES6. Exporta traducciones y función switchLanguage.

// ============================================================
// 1. TRADUCCIONES
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
        colorThemeLabel: "Tema de Tablero",
        pieceThemeLabel: "Estilo de Piezas",
        perspectiveLabel: "Perspectiva",
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
            pawnCaptured: (kills) => `¡Peón capturado! Exp: ${kills}/3★`,
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
        colorThemeLabel: "Board Theme",
        pieceThemeLabel: "Piece Style",
        perspectiveLabel: "Perspective",
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
            pawnCaptured: (kills) => `Pawn captured! Exp: ${kills}/3★`,
            promotePawnKill: (name) => `Promotion! ${name}`,
            promoteQueen: "The Queen ascends to Empress!",
            promoteZone: (name) => `${name} promoted by territory!`,
            castleRight: "Imperial Castling Right Flank!",
            castleLeft: "Imperial Castling Left Flank!"
        }
    }
};

// ============================================================
// 2. ESTADO
// ============================================================
let currentLang = 'es';

export function getCurrentLang() {
    return currentLang;
}

// ============================================================
// 3. SWITCH LANGUAGE
// ============================================================

export function switchLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;

    const t = TRANSLATIONS[lang];
    const l = t.legend;
    const r = t.rules;

    // --- Helper seguro ---
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    const setHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    // --- Títulos y generales ---
    setText('ui-title', t.title);
    setText('ui-subtitle', t.subtitle);
    setText('ui-turn-label', t.turnLabel);
    setText('ui-mode-label', t.modeLabel);
    setText('ui-diff-label', t.diffLabel);
    setText('ui-color-theme-label', t.colorThemeLabel);
    setText('ui-piece-theme-label', t.pieceThemeLabel);
    setText('ui-perspective-label', t.perspectiveLabel);
    setText('ui-tools-label', t.toolsLabel);
    setText('ui-history-label', t.historyLabel);
    setText('ui-legend-label', t.legendLabel);

    // --- Opciones de selectores ---
    setText('opt-pvp', t.optPvp);
    setText('opt-pvc', t.optPvc);
    setText('diff-easy', t.diffEasy);
    setText('diff-med', t.diffMed);
    setText('diff-hard', t.diffHard);
    setText('diff-master', t.diffMaster);

    // --- Botones ---
    setText('btn-new-game', t.newGame);
    setText('btn-undo', t.undo);
    setText('btn-coords', t.coords);

    // --- Leyenda de piezas ---
    setText('legend-pawn', l.pawn);
    setText('legend-rook', l.rook);
    setText('legend-knight', l.knight);
    setText('legend-paladin', l.paladin);
    setText('legend-bishop', l.bishop);
    setText('legend-queen', l.queen);
    setText('legend-emperor', l.emperor);

    // --- Reglas ---
    setText('rules-title', r.title);
    setText('rules-obj', r.objCheckmate);
    setText('rules-promo', r.promotionGeneral);
    setText('rules-cap-title', r.captureAscentTitle);
    setText('rules-cap-vigia', r.captureVigia);
    setText('rules-cap-queen', r.captureQueen);
    setHtml('rules-zone', `<strong>${r.zoneAscentTitle.split(':')[0]}:</strong> ${r.zoneAscentTitle.split(':')[1] || ''}`);
    setText('rules-castle', r.castlingRule);
    setText('rules-cond-title', r.castlingCondTitle);
    setText('rules-cond-1', r.condFlank);
    setText('rules-cond-2', r.condMobility);
    setText('rules-cond-3', r.condSafe);
    setText('rules-manual-pre', r.manualPreText);

    // --- Enlace del manual (texto + href) ---
    const manualLink = document.getElementById('rules-manual-link');
    if (manualLink) {
        manualLink.textContent = r.manualLinkText;
        manualLink.href = r.manualFile;
    }

    // --- Turno actual (preserva el turno en curso) ---
    updateTurnText();
}

/**
 * Actualiza el texto del turno según el idioma actual y el estado del juego.
 * Se exporta para que game.js la llame tras cambios de turno.
 */
export function updateTurnText(turn = null) {
    const t = TRANSLATIONS[currentLang];
    const turnTextEl = document.getElementById('turn-text');
    if (!turnTextEl) return;

    if (turn === 'none') {
        turnTextEl.textContent = 'Fin';
    } else if (turn === 'white') {
        turnTextEl.textContent = t.whiteText;
    } else if (turn === 'black') {
        turnTextEl.textContent = t.blackText;
    } else {
        // Si no se pasa turno, mantener el texto actual según el indicador visual
        const indicator = document.getElementById('turn-indicator-color');
        if (indicator) {
            const isWhite = indicator.classList.contains('bg-white');
            turnTextEl.textContent = isWhite ? t.whiteText : t.blackText;
        }
    }
}