const translations = {
    es: {
        title: "Ajedrez Imperial",
        subtitle: "Tablero 10x10. Mecanicas de ascenso de clases.",
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
        toolsLabel: "Herramientas / Practica",
        undo: "↩ Deshacer",
        coords: "(x;y) Coordenadas",
        historyLabel: "Historial Imperial",
        legendLabel: "Leyenda de Piezas",
        legend: {
            pawn: "Peon / Sargento",
            rook: "Vigia / Torre",
            knight: "Caballo / C. Imperial",
            paladin: "Paladin / G. Imperial",
            bishop: "Escudero / Alfil",
            queen: "Reina / Emperatriz",
            emperor: "Emperador"
        },
        rules: {
            title: "Reglas del Juego",
            objCheckmate: "* El objetivo es dar Jaque Mate al Emperador.",
            promotionGeneral: "* Las piezas ascienden capturando piezas o avanzando al territorio rival.",
            captureAscentTitle: "Ascenso por captura:",
            captureVigia: "- Vigia/Escudero -> 3 peones.",
            captureQueen: "- Reina -> 1 pieza cualquiera.",
            zoneAscentTitle: "Asenso por zona: al llegar a ultimas 2 filas enemigas, Peon/Caballo/Paladin",
            castlingRule: "* Enroque imperial se intercambia posiciones entre emperador y vigia, similar al enroque en ajedrez.",
            castlingCondTitle: "Condiciones Enroque Imperial:",
            condFlank: "- Limpieza de flanco",
            condMobility: "- Inmovilidad previa vigia y emperador",
            condSafe: "- Casillas seguras.",
            manualPreText: "Accede al reglamento oficial ",
            manualLinkText: "aqui",
            manualFile: "assets/docs/reglamento-ajedrez-imperial-es.pdf"
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
            captureVigia: "- Lookout/Squire -> 3 pawns.",
            captureQueen: "- Queen -> Any 1 piece.",
            zoneAscentTitle: "Zone promotion: upon reaching the last 2 enemy rows, Pawn/Knight/Paladin",
            castlingRule: "* Imperial Castling swaps positions between the emperor and the lookout, similar to castling in chess.",
            castlingCondTitle: "Imperial Castling Conditions:",
            condFlank: "- Flank clearance",
            condMobility: "- Prior immobility of lookout and emperor",
            condSafe: "- Safe squares.",
            manualPreText: "Access the official rulebook ",
            manualLinkText: "here",
            manualFile: "assets/docs/official-rulebook-imperial-chess-en.pdf" // Reemplaza con la ruta de tu PDF en inglés
        }
    }
};

let currentLang = 'es';

function switchLanguage(lang) {
    currentLang = lang;
    const t = translations[currentLang];
    const l = t.legend;
    const r = t.rules;

    // Elementos generales del menú
    document.getElementById('ui-title').textContent = t.title;
    document.getElementById('ui-subtitle').textContent = t.subtitle;
    document.getElementById('ui-turn-label').textContent = t.turnLabel;
    
    if (typeof turn !== 'undefined') {
        const turnTextEl = document.getElementById('turn-text');
        if (turnTextEl) turnTextEl.textContent = (turn === 'white') ? t.whiteText : t.blackText;
    }

    document.getElementById('ui-mode-label').textContent = t.modeLabel;
    document.getElementById('opt-pvp').textContent = t.optPvp;
    document.getElementById('opt-pvc').textContent = t.optPvc;
    document.getElementById('ui-diff-label').textContent = t.diffLabel;
    document.getElementById('diff-easy').textContent = t.diffEasy;
    document.getElementById('diff-med').textContent = t.diffMed;
    document.getElementById('diff-hard').textContent = t.diffHard;
    document.getElementById('diff-master').textContent = t.diffMaster;
    document.getElementById('btn-new-game').textContent = t.newGame;
    document.getElementById('ui-tools-label').textContent = t.toolsLabel;
    document.getElementById('btn-undo').textContent = t.undo;
    document.getElementById('btn-coords').textContent = t.coords;
    document.getElementById('ui-history-label').textContent = t.historyLabel;
    
    // Leyenda de Piezas
    document.getElementById('ui-legend-label').textContent = t.legendLabel;
    document.getElementById('legend-pawn').textContent = l.pawn;
    document.getElementById('legend-rook').textContent = l.rook;
    document.getElementById('legend-knight').textContent = l.knight;
    document.getElementById('legend-paladin').textContent = l.paladin;
    document.getElementById('legend-bishop').textContent = l.bishop;
    document.getElementById('legend-queen').textContent = l.queen;
    document.getElementById('legend-emperor').textContent = l.emperor;

    // Reglas del juego
    document.getElementById('rules-title').textContent = r.title;
    document.getElementById('rules-obj').textContent = r.objCheckmate;
    document.getElementById('rules-promo').textContent = r.promotionGeneral;
    document.getElementById('rules-cap-title').textContent = r.captureAscentTitle;
    document.getElementById('rules-cap-vigia').textContent = r.captureVigia;
    document.getElementById('rules-cap-queen').textContent = r.captureQueen;
    document.getElementById('rules-zone').innerHTML = `<strong>${r.zoneAscentTitle.split(':')[0]}:</strong>${r.zoneAscentTitle.split(':')[1]}`;
    document.getElementById('rules-castle').textContent = r.castlingRule;
    document.getElementById('rules-cond-title').textContent = r.castlingCondTitle;
    document.getElementById('rules-cond-1').textContent = r.condFlank;
    document.getElementById('rules-cond-2').textContent = r.condMobility;
    document.getElementById('rules-cond-3').textContent = r.condSafe;
    document.getElementById('rules-manual-pre').textContent = r.manualPreText;
    
    // Actualizar texto y enlace del PDF
    const manualLink = document.getElementById('rules-manual-link');
    manualLink.textContent = r.manualLinkText;
    manualLink.href = r.manualFile;
}