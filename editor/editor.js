// ============================================================
// EDITOR.JS - Herramienta de edicion para Ajedrez Imperial 10x10
// ============================================================
// Depende de: game.js (debe cargarse ANTES que este archivo)

// --- Estado del Editor ---
let editorMode = 'edit';          // 'edit' | 'play'
let editorColor = 'white';        // Color activo en paleta
let selectedPalettePiece = null;  // Nombre de pieza seleccionada (ej: 'peon')
let selectedTool = null;          // null | 'eraser'
let editorMoveHistory = [];       // Log JSON exportable

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

// Ajustar rutas de imagenes si editor esta en subcarpeta /editor/
// game.js ya define PIECE_IMAGES con rutas relativas a la raiz.
// Si estamos en /editor/, agregamos '../' para subir un nivel.
(function adjustImagePaths() {
    if (window.location.pathname.indexOf('/editor/') !== -1 ||
        window.location.pathname.endsWith('/editor')) {
        for (const color in PIECE_IMAGES) {
            for (const key in PIECE_IMAGES[color]) {
                const current = PIECE_IMAGES[color][key];
                if (current && !current.startsWith('../')) {
                    PIECE_IMAGES[color][key] = '../' + current;
                }
            }
        }
        console.log('[Editor] Rutas de imagenes ajustadas para subcarpeta /editor/');
    }
})();

const PALETTE_ORDER = [
    'peon','sargento','vigia','torre','caballo','caballero',
    'escudero','alfil','paladin','general_real','reina','emperatriz','emperador'
];

// ============================================================
// INICIALIZACION ROBUSTA
// ============================================================
function initEditor() {
    console.log('[Editor] Inicializando...');

    // Forzar estado limpio del tablero
    board = Array(BOARD_SIZE).fill(null).map(function() { return Array(BOARD_SIZE).fill(null); });
    turn = 'white';
    selectedPiece = null;
    validMoves = [];
    lastMove = null;
    capturedPawns = { white: 0, black: 0 };
    moveHistory = [];
    moveHistoryText = [];
    editorMoveHistory = [];
    editorMode = 'edit';
    editorColor = 'white';
    selectedPalettePiece = null;
    selectedTool = null;

    // Sobrescribir handlers globales de game.js
    window.handleSquareClick = editorHandleSquareClick;
    window.updateHistoryUI = editorUpdateHistoryUI;

    // Registrar click derecho en tablero
    const boardEl = document.getElementById('board');
    if (boardEl) {
        boardEl.removeEventListener('contextmenu', editorContextMenuHandler);
        boardEl.addEventListener('contextmenu', editorContextMenuHandler);
    }

    // Renderizar todo
    try {
        renderPalette();
        updateUI();
        renderBoard();
        renderExternalCoords();
        editorUpdateHistoryUI();
        updateModeUI();
        showMessage('Modo Edicion activo. Coloca piezas en el tablero.');
        console.log('[Editor] Inicializacion completa. Tablero vacio listo.');
    } catch (e) {
        console.error('[Editor] Error en inicializacion:', e);
    }
}

// ============================================================
// PALETA DE PIEZAS
// ============================================================
function renderPalette() {
    const palette = document.getElementById('editor-palette');
    if (!palette) return;
    palette.innerHTML = '';

    PALETTE_ORDER.forEach(name => {
        const div = document.createElement('div');
        div.className = 'palette-piece bg-[#262421] rounded p-1 flex items-center justify-center aspect-square';
        div.dataset.piece = name;
        div.title = name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ');

        const img = document.createElement('img');
        const imgName = PIECE_IMAGES[editorColor][name] || '';
        img.src = imgName;
        img.className = 'w-7 h-7 sm:w-8 sm:h-8 object-contain pointer-events-none';
        img.onerror = function() { this.style.display = 'none'; };

        div.appendChild(img);
        div.onclick = () => selectPalettePiece(name, div);
        palette.appendChild(div);
    });
}

function selectPalettePiece(name, element) {
    selectedTool = null;
    selectedPalettePiece = name;

    document.querySelectorAll('.palette-piece').forEach(el => el.classList.remove('selected'));
    const eraserBtn = document.getElementById('tool-eraser');
    if (eraserBtn) eraserBtn.classList.remove('active');
    element.classList.add('selected');

    const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ');
    showMessage('Seleccionado: ' + displayName + ' (' + (editorColor === 'white' ? 'Blancas' : 'Negras') + ')');
}

function setEditorColor(color) {
    editorColor = color;

    const btnWhite = document.getElementById('color-white');
    const btnBlack = document.getElementById('color-black');
    if (btnWhite) {
        btnWhite.className = color === 'white'
            ? 'px-3 py-1 rounded text-xs font-bold bg-white text-[#262421] transition'
            : 'px-3 py-1 rounded text-xs font-bold text-gray-400 hover:text-white transition';
    }
    if (btnBlack) {
        btnBlack.className = color === 'black'
            ? 'px-3 py-1 rounded text-xs font-bold bg-[#111] text-white border border-gray-600 transition'
            : 'px-3 py-1 rounded text-xs font-bold text-gray-400 hover:text-white transition';
    }

    renderPalette();
    if (selectedPalettePiece) {
        const displayName = selectedPalettePiece.charAt(0).toUpperCase() + selectedPalettePiece.slice(1).replace('_', ' ');
        showMessage('Seleccionado: ' + displayName + ' (' + (color === 'white' ? 'Blancas' : 'Negras') + ')');
    }
}

function setEditorTool(tool) {
    if (tool === 'eraser') {
        selectedPalettePiece = null;
        selectedTool = 'eraser';
        document.querySelectorAll('.palette-piece').forEach(el => el.classList.remove('selected'));
        const eraserBtn = document.getElementById('tool-eraser');
        if (eraserBtn) eraserBtn.classList.add('active');
        showMessage('Borrador activado. Clic en una pieza para eliminarla.');
    }
}

// ============================================================
// MANEJO DE CLICKS EN EL TABLERO
// ============================================================
function editorHandleSquareClick(r, c) {
    if (editorMode === 'edit') {
        handleEditClick(r, c);
    } else {
        handlePlayClick(r, c);
    }
}

function handleEditClick(r, c) {
    // Borrador: eliminar pieza
    if (selectedTool === 'eraser') {
        if (board[r][c]) {
            board[r][c] = null;
            renderBoard();
            showMessage('Pieza eliminada.');
        }
        return;
    }

    // Colocar pieza de paleta en casilla vacia
    if (selectedPalettePiece && !board[r][c]) {
        const data = PALETTE_MAP[selectedPalettePiece];
        if (!data) return;

        board[r][c] = {
            type: data.type,
            color: editorColor,
            promoted: data.promoted,
            kills: 0,
            hasMoved: false
        };
        renderBoard();
        const displayName = selectedPalettePiece.charAt(0).toUpperCase() + selectedPalettePiece.slice(1).replace('_', ' ');
        showMessage(displayName + ' colocado en ' + getSquareNotation(r, c));
        return;
    }

    // Mover pieza libremente (drag-and-drop simple en modo edicion)
    if (board[r][c] && !selectedPalettePiece) {
        if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
            selectedPiece = null;
        } else {
            selectedPiece = { r, c, editDrag: true };
        }
        renderBoard();
        return;
    }

    // Soltar pieza arrastrada en casilla vacia
    if (selectedPiece && selectedPiece.editDrag && !board[r][c]) {
        board[r][c] = board[selectedPiece.r][selectedPiece.c];
        board[selectedPiece.r][selectedPiece.c] = null;
        selectedPiece = null;
        renderBoard();
        showMessage('Pieza movida (libre).');
        return;
    }

    selectedPiece = null;
    renderBoard();
}

function handlePlayClick(r, c) {
    if (turn === 'none') return;

    const piece = board[r][c];
    const move = validMoves.find(function(m) { return m.r === r && m.c === c; });

    if (selectedPiece && move) {
        const movingPiece = board[selectedPiece.r][selectedPiece.c];
        if (!movingPiece) {
            selectedPiece = null;
            validMoves = [];
            renderBoard();
            return;
        }

        // Log JSON exportable
        const targetPiece = board[r][c];
        const logEntry = {
            from: getSquareNotation(selectedPiece.r, selectedPiece.c),
            to: getSquareNotation(r, c),
            piece: (movingPiece.color === 'white' ? 'w' : 'b') + getPieceSymbol(movingPiece, selectedPiece.c),
            capture: !!targetPiece,
            captureType: targetPiece ? targetPiece.type : null,
            turn: turn,
            notation: formatMoveNotation(selectedPiece.r, selectedPiece.c, r, c, movingPiece, targetPiece)
        };
        editorMoveHistory.push(logEntry);
        console.log('[Editor Move Log]', JSON.stringify(logEntry));

        // Ejecutar movimiento
        executeMove(selectedPiece.r, selectedPiece.c, r, c);
        selectedPiece = null;
        validMoves = [];

        // Actualizar UI inmediatamente
        renderBoard();

        if (turn !== 'none') {
            switchTurn();
        }
        return;
    }

    if (piece && piece.color === turn) {
        selectedPiece = { r: r, c: c };
        validMoves = getLegalMoves(r, c);
    } else {
        selectedPiece = null;
        validMoves = [];
    }

    renderBoard();
}

// ============================================================
// CLICK DERECHO PARA BORRAR
// ============================================================
function editorContextMenuHandler(e) {
    if (editorMode !== 'edit') return;
    const square = e.target.closest('.square');
    if (!square) return;
    e.preventDefault();

    const boardEl = document.getElementById('board');
    const squares = Array.from(boardEl.children);
    const index = squares.indexOf(square);
    if (index === -1) return;

    const r = Math.floor(index / BOARD_SIZE);
    const c = index % BOARD_SIZE;

    if (board[r][c]) {
        board[r][c] = null;
        renderBoard();
        showMessage('Pieza eliminada (clic derecho).');
    }
}

// ============================================================
// CAMBIO DE MODOS (EDIT / PLAY)
// ============================================================
function startPlayMode() {
    const kings = countKings();
    if (kings.white === 0 || kings.black === 0) {
        showMessage('Error: Se requiere un Emperador de cada color.');
        return;
    }

    editorMode = 'play';
    selectedPiece = null;
    validMoves = [];
    turn = 'white';
    capturedPawns = { white: 0, black: 0 };
    moveHistory = [];
    moveHistoryText = [];

    updateModeUI();
    updateUI();
    renderBoard();
    showMessage('Modo Juego activado. Blancas mueven primero.');
}

function stopPlayMode() {
    editorMode = 'edit';
    selectedPiece = null;
    validMoves = [];
    updateModeUI();
    renderBoard();
    showMessage('Juego detenido. Posicion congelada. Puedes editar.');
}

function setEditMode() {
    stopPlayMode();
}

function updateModeUI() {
    const badge = document.getElementById('mode-badge');
    const editorControls = document.getElementById('editor-controls');
    const playControls = document.getElementById('play-controls');
    const btnPlay = document.getElementById('btn-play');
    const btnStop = document.getElementById('btn-stop');

    if (editorMode === 'play') {
        if (badge) {
            badge.textContent = 'Juego';
            badge.className = 'mode-badge bg-green-600/20 text-green-400 px-2 py-0.5 rounded border border-green-600/30';
        }
        if (editorControls) { editorControls.classList.add('hidden'); editorControls.classList.remove('flex'); }
        if (playControls) { playControls.classList.remove('hidden'); playControls.classList.add('flex'); }
        if (btnPlay) btnPlay.classList.add('hidden');
        if (btnStop) { btnStop.classList.remove('hidden'); btnStop.classList.add('flex'); }
    } else {
        if (badge) {
            badge.textContent = 'Edicion';
            badge.className = 'mode-badge bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-600/30';
        }
        if (editorControls) { editorControls.classList.remove('hidden'); editorControls.classList.add('flex'); }
        if (playControls) { playControls.classList.add('hidden'); playControls.classList.remove('flex'); }
        if (btnPlay) btnPlay.classList.remove('hidden');
        if (btnStop) { btnStop.classList.add('hidden'); btnStop.classList.remove('flex'); }
    }
}

// ============================================================
// HERRAMIENTAS DEL EDITOR
// ============================================================
function clearBoardEditor() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    selectedPiece = null;
    validMoves = [];
    moveHistory = [];
    moveHistoryText = [];
    editorMoveHistory = [];
    editorUpdateHistoryUI();
    renderBoard();
    showMessage('Tablero vaciado.');
}

function loadInitialPosition() {
    initBoard();
    selectedPiece = null;
    validMoves = [];
    moveHistory = [];
    moveHistoryText = [];
    editorMoveHistory = [];
    capturedPawns = { white: 0, black: 0 };
    editorUpdateHistoryUI();
    renderBoard();
    showMessage('Posicion inicial cargada.');
}

function countKings() {
    let white = 0, black = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] && board[r][c].type === 'king') {
                board[r][c].color === 'white' ? white++ : black++;
            }
        }
    }
    return { white, black };
}

function forceSwitchTurn() {
    if (editorMode !== 'play') return;
    turn = turn === 'white' ? 'black' : 'white';
    selectedPiece = null;
    validMoves = [];
    updateUI();
    renderBoard();
    showMessage('Turno forzado: ' + (turn === 'white' ? 'Blancas' : 'Negras'));
}

function clearHistory() {
    moveHistoryText = [];
    editorMoveHistory = [];
    editorUpdateHistoryUI();
    showMessage('Historial limpiado.');
}

function editorUpdateHistoryUI(notation) {
    const listEl = document.getElementById('move-history-list');
    if (!listEl) return;
    if (notation) moveHistoryText.push(notation);
    listEl.innerHTML = '';
    if (moveHistoryText.length === 0) {
        listEl.innerHTML = '<div class="text-gray-500 text-xs italic text-center py-4">No hay movimientos registrados</div>';
        return;
    }
    moveHistoryText.forEach((move, index) => {
        const div = document.createElement('div');
        div.className = 'border-b border-[#3e3c39] py-0.5';
        div.innerText = (index + 1) + '. ' + move;
        listEl.appendChild(div);
    });
    listEl.scrollTop = listEl.scrollHeight;
}

// ============================================================
// GENERACION ALEATORIA INTELIGENTE (CORREGIDA)
// ============================================================
function generateRandomPosition() {
    const playerInput = document.getElementById('rand-player-count');
    const opponentInput = document.getElementById('rand-opponent-count');
    const playerCount = Math.max(1, Math.min(20, parseInt(playerInput && playerInput.value ? playerInput.value : 8)));
    const opponentCount = Math.max(1, Math.min(20, parseInt(opponentInput && opponentInput.value ? opponentInput.value : 8)));

    let attempts = 0;
    const maxAttempts = 300;

    while (attempts < maxAttempts) {
        attempts++;
        board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

        if (!generateSideRandom('white', playerCount)) continue;
        if (!generateSideRandom('black', opponentCount)) continue;

        if (!areKingsValid()) continue;
        if (isKingInCheck('white')) continue;

        renderBoard();
        showMessage('Posicion aleatoria generada (' + attempts + ' intentos). B:' + playerCount + ' N:' + opponentCount);
        return;
    }

    showMessage('No se pudo generar una posicion valida en ' + maxAttempts + ' intentos. Prueba con menos piezas.');
}

function generateSideRandom(color, requestedCount) {
    const occupied = new Set();

    // 1. Colocar Rey obligatorio (siempre exactamente 1)
    const kingPos = getRandomEmptyCell(occupied, 'king', color);
    if (!kingPos) return false;
    board[kingPos.r][kingPos.c] = createPiece('king', color, false);
    occupied.add(kingPos.r + ',' + kingPos.c);

    // 2. Decidir cantidades realistas respetando maximos del reglamento
    const maxCounts = { queen: 1, rook: 2, bishop: 2, knight: 2, paladin: 2, pawn: 10 };
    const pool = ['queen', 'rook', 'bishop', 'knight', 'paladin', 'pawn'];

    let remaining = requestedCount - 1;
    const counts = {};

    // Primero: asegurar variedad minima si hay suficientes piezas
    if (remaining >= 3) {
        counts['pawn'] = 1;
        remaining--;
    }
    if (remaining >= 2) {
        const major = pool.filter(function(t) { return t !== 'pawn'; })[Math.floor(Math.random() * 5)];
        counts[major] = (counts[major] || 0) + 1;
        remaining--;
    }

    // Distribuir el resto aleatoriamente respetando maximos
    let safety = 0;
    while (remaining > 0 && safety < 200) {
        safety++;
        const type = pool[Math.floor(Math.random() * pool.length)];
        const current = counts[type] || 0;
        if (current < maxCounts[type]) {
            counts[type] = current + 1;
            remaining--;
        }
    }

    if (remaining > 0) return false;

    // 3. Colocar cada pieza decidida
    for (const type in counts) {
        const qty = counts[type];
        for (let i = 0; i < qty; i++) {
            let pos = null;
            let tries = 0;
            do {
                pos = getRandomEmptyCell(occupied, type, color);
                tries++;
                if (tries > 100) return false;
            } while (!pos);

            const promoted = shouldBePromoted(type, pos.r, color);
            board[pos.r][pos.c] = createPiece(type, color, promoted);
            occupied.add(pos.r + ',' + pos.c);
        }
    }

    return true;
}

function createPiece(type, color, promoted) {
    return {
        type: type,
        color: color,
        promoted: promoted,
        kills: promoted && (type === 'rook' || type === 'bishop') ? 3 : 0,
        hasMoved: true
    };
}

function shouldBePromoted(type, r, color) {
    if (type === 'pawn') {
        if (color === 'white' && r <= 1) return Math.random() < 0.85;
        if (color === 'black' && r >= 8) return Math.random() < 0.85;
        return false;
    }

    if (type === 'knight' || type === 'paladin') {
        if (color === 'white' && r <= 1) return Math.random() < 0.70;
        if (color === 'black' && r >= 8) return Math.random() < 0.70;
        return false;
    }

    if (type === 'queen') {
        return Math.random() < 0.15;
    }

    if (type === 'bishop' || type === 'rook') {
        return Math.random() < 0.10;
    }

    return false;
}

function getRandomEmptyCell(occupied, type, color) {
    let attempts = 0;
    while (attempts < 200) {
        const r = Math.floor(Math.random() * BOARD_SIZE);
        const c = Math.floor(Math.random() * BOARD_SIZE);
        const key = r + ',' + c;

        if (occupied.has(key) || board[r][c]) {
            attempts++;
            continue;
        }

        if (!isValidRandomPosition(type, r, color)) {
            attempts++;
            continue;
        }

        return { r: r, c: c };
    }
    return null;
}

function isValidRandomPosition(type, r, color) {
    if (type === 'pawn' && (r === 0 || r === 9)) return false;

    if (type === 'pawn') {
        if (r < 2 || r > 7) return Math.random() < 0.10;
    }

    if (type !== 'pawn' && type !== 'king') {
        const preferredZone = color === 'white' ? (r >= 5) : (r <= 4);
        if (!preferredZone && Math.random() < 0.65) return false;
    }

    if (type === 'king' && (r === 0 || r === 9)) {
        return Math.random() < 0.20;
    }

    return true;
}

function areKingsValid() {
    let wk = null, bk = null;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] && board[r][c].type === 'king') {
                if (board[r][c].color === 'white') wk = {r: r, c: c};
                else bk = {r: r, c: c};
            }
        }
    }
    if (!wk || !bk) return false;

    const dr = Math.abs(wk.r - bk.r);
    const dc = Math.abs(wk.c - bk.c);
    if (dr <= 1 && dc <= 1) return false;

    return true;
}

// ============================================================
// INICIALIZACION - Llamada robusta
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditor);
} else {
    initEditor();
}