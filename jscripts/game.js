const BOARD_SIZE = 10;
let board = [];
let turn = 'white';
let selectedPiece = null;
let validMoves = [];
let lastMove = null;
let moveHistoryText = [];
let moveHistory = [];
let capturedPawns = { white: 0, black: 0 };
let gameMode = 'pvp';
let cpuThinking = false;
let showCoordsInternal = false;

const PIECES = {
    'pawn': { base: 'peon', promoted: 'sargento' },
    'rook': { base: 'vigia', promoted: 'torre' },
    'knight': { base: 'caballo', promoted: 'caballero' },
    'bishop': { base: 'escudero', promoted: 'alfil' },
    'paladin': { base: 'paladin', promoted: 'general_real' },
    'queen': { base: 'reina', promoted: 'emperatriz' },
    'king': { base: 'emperador', promoted: 'emperador' }
};

const PIECE_IMAGES = {
    white: {
        alfil: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-alfil.png',
        caballero: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-caballero.png',
        caballo: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-caballo.png',
        emperador: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-emperador.png',
        emperatriz: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-emperatriz.png',
        escudero: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-escudero.png',
        general_real: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-general-real.png',
        paladin: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-paladin.png',
        peon: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-peon-b.png',
        reina: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-reina.png',
        sargento: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/b-sargento.png',
        torre: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons//b-torre.png',
        vigia: 'assets/icons/b-vigia.png'
    },
    black: {
        alfil: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-alfil.png',
        caballero: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-caballero.png',
        caballo: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-caballo.png',
        emperador: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-emperador.png',
        emperatriz: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-emperatriz.png',
        escudero: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-escudero.png',
        general_real: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-general-real.png',
        paladin: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-paladin.png',
        peon: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-peon.png',
        reina: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-reina.png',
        sargento: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-sargento.png',
        torre: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-torre.png',
        vigia: 'https://haruki-24.github.io/Ajedrez-Imperial/assets/icons/n-vigia.png'
    }
};

function changeGameMode(mode) {
    gameMode = mode;
    resetGame();
    showMessage(mode === 'pvc' ? 'Modo: Jugador (Blancas) vs CPU (Negras)' : 'Modo: 2 Jugadores');
}

function resetGame() {
    initBoard();
    turn = 'white';
    selectedPiece = null;
    validMoves = [];
    lastMove = null;
    capturedPawns = { white: 0, black: 0 };
    moveHistory = [];
    moveHistoryText = [];
    cpuThinking = false;
    updateUI();
    renderBoard();
    updateHistoryUI();
    showMessage("Partida reiniciada!");
}

function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    const backRow = ['rook', 'knight', 'bishop', 'paladin', 'queen', 'king', 'paladin', 'bishop', 'knight', 'rook'];
    for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = { type: backRow[c], color: 'black', promoted: false, kills: 0, hasMoved: false };
        board[1][c] = { type: 'pawn', color: 'black', promoted: false, kills: 0, hasMoved: false };
        board[8][c] = { type: 'pawn', color: 'white', promoted: false, kills: 0, hasMoved: false };
        board[9][c] = { type: backRow[c], color: 'white', promoted: false, kills: 0, hasMoved: false };
    }
}

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    let kingPos = { white: null, black: null };
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c]?.type === 'king') kingPos[board[r][c].color] = {r, c};
        }
    }
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
           
            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            if (showCoordsInternal) square.classList.add('show-coords');
            
            // Resaltar selección y último movimiento
            if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                square.classList.add('selected');
            }
            if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c))) {
                square.classList.add('last-move');
            }
            
            // Resaltar jaque
            if (kingPos.white && r === kingPos.white.r && c === kingPos.white.c && isKingInCheck('white')) {
                square.classList.add('check');
            }
            if (kingPos.black && r === kingPos.black.r && c === kingPos.black.c && isKingInCheck('black')) {
                square.classList.add('check');
            }

            // Renderizar Pieza con Imágenes
            const piece = board[r][c];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${piece.color}`;
                pieceEl.innerHTML = '';
                
                // 1. Obtenemos el nombre clave de la pieza
                const pieceName = piece.promoted ? PIECES[piece.type].promoted : PIECES[piece.type].base;
                
                // Diagnóstico en consola si la clave no existe
                if (!PIECE_IMAGES[piece.color] || !PIECE_IMAGES[piece.color][pieceName]) {
                    console.error(`Error: No existe clave en PIECE_IMAGES para color: "${piece.color}" y pieceName: "${pieceName}"`);
                }

                // 2. Creamos el elemento de imagen
                const img = document.createElement('img');
                
                // 3. Asignamos la ruta
                const imagePath = PIECE_IMAGES[piece.color] ? PIECE_IMAGES[piece.color][pieceName] : '';
                img.src = imagePath;
                img.classList.add('piece-image');
                
                // En lugar de ocultar la imagen si falla, mostramos en consola la URL exacta que falló
                img.onerror = function() {
                    console.error(`Error 404 cargando imagen: ${this.src}`);
                    // Muestra un borde rojo en la pieza para saber qué casilla está fallando visualmente
                    this.style.border = '1px solid red'; 
                };
                
                // 4. Agregamos la imagen al contenedor
                pieceEl.appendChild(img);
                
                // Estrellas de experiencia
                if (!piece.promoted && piece.kills > 0) {
                    const starsContainer = document.createElement('span');
                    starsContainer.className = 'stars-badge';
                    starsContainer.innerText = '★'.repeat(piece.kills);
                    pieceEl.appendChild(starsContainer);
                }
                square.appendChild(pieceEl);
            }

            // Renderizar indicadores de movimiento válido
            const move = validMoves.find(m => m.r === r && m.c === c);
            if (move) {
                const marker = document.createElement('div');
                marker.className = move.capture ? 'valid-capture-ring' : 'valid-move-dot';
                square.appendChild(marker);
            }

            // Coordenada interna opcional
            const coordLabel = document.createElement('span');
            coordLabel.className = 'square-coord';
            coordLabel.innerText = getSquareNotation(r, c);
            square.appendChild(coordLabel);

            square.onclick = () => handleSquareClick(r, c);
            boardEl.appendChild(square);
        }
    }
    // Renderizamos las coordenadas externas una vez generado el tablero
    renderExternalCoords();
}

// Función para renderizar coordenadas externas
function renderExternalCoords() {
    const yContainer = document.getElementById('y-coords');
    const xContainer = document.getElementById('x-coords');
    
    if (!yContainer || !xContainer) return;
    yContainer.innerHTML = '';
    xContainer.innerHTML = '';
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        const yLabel = document.createElement('div');
        yLabel.className = 'coord-y';
        yLabel.innerText = (r < 5) ? `${5 - r}N` : `${r - 4}S`;
        yContainer.appendChild(yLabel);
    }
    
    for (let c = 0; c < BOARD_SIZE; c++) {
        const xLabel = document.createElement('div');
        xLabel.className = 'coord-x';
        xLabel.innerText = (c < 5) ? `${5 - c}O` : `${c - 4}E`;
        xContainer.appendChild(xLabel);
    }
}

function toggleCoords() {
    showCoordsInternal = !showCoordsInternal;
    renderBoard();
}

function handleSquareClick(r, c) {
    if (cpuThinking || turn === 'none') return;
    if (gameMode === 'pvc' && turn === 'black') return;

    const piece = board[r][c];
    const move = validMoves.find(m => m.r === r && m.c === c);

    if (selectedPiece && move) {
        executeMove(selectedPiece.r, selectedPiece.c, r, c);
        selectedPiece = null;
        validMoves = [];
        if (turn !== 'none') {
            switchTurn();
        }
    } else if (piece && piece.color === turn) {
        selectedPiece = { r, c };
        validMoves = getLegalMoves(r, c);
    } else {
        selectedPiece = null;
        validMoves = [];
    }
    renderBoard();
}

// --- JAQUE Y MOVIMIENTOS LEGALES ---

function isKingInCheck(color) {
    let kingR = -1, kingC = -1;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c]?.type === 'king' && board[r][c]?.color === color) {
                kingR = r; kingC = c; break;
            }
        }
        if (kingR !== -1) break;
    }
    if (kingR === -1) return false;
    const opponent = color === 'white' ? 'black' : 'white';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.color === opponent) {
                const moves = getValidMoves(r, c, true);
                if (moves.some(m => m.r === kingR && m.c === kingC)) return true;
            }
        }
    }
    return false;
}

function getLegalMoves(r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const moves = getValidMoves(r, c);
    return moves.filter(move => {
        const target = board[move.r][move.c];
        board[move.r][move.c] = piece;
        board[r][c] = null;
        const inCheck = isKingInCheck(piece.color);
        board[r][c] = piece;
        board[move.r][move.c] = target;
        return !inCheck;
    });
}

function isCheckmate(color) {
    if (!isKingInCheck(color)) return false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.color === color) {
                if (getLegalMoves(r, c).length > 0) return false;
            }
        }
    }
    return true;
}

function isStalemate(color) {
    if (isKingInCheck(color)) return false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.color === color) {
                if (getLegalMoves(r, c).length > 0) return false;
            }
        }
    }
    return true;
}


// Función para detectar amenazas (Inmunidad al Ataque para Enroque) 
function isSquareAttacked(targetR, targetC, attackerColor) {
    // Colocamos temporalmente una pieza "señuelo" para calcular correctamente 
    // si los peones y piezas enemigas pueden atacar esta casilla, incluso estando vacía.
    const originalPiece = board[targetR][targetC];
    const dummyColor = attackerColor === 'white' ? 'black' : 'white';
    
    board[targetR][targetC] = { color: dummyColor, type: 'dummy' };
    let attacked = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.color === attackerColor) {
                const moves = getValidMoves(r, c, true); // true para evitar bucles de enroque infinitos
                if (moves.some(m => m.r === targetR && m.c === targetC)) {
                    attacked = true; break;
                }
            }
        }
        if (attacked) break;
    }
    board[targetR][targetC] = originalPiece;
    return attacked;
}

function getValidMoves(r, c, ignoreCastling = false) {
    const piece = board[r][c];
    if (!piece) return [];
    let moves = [];

    // Función auxiliar para añadir movimientos verificando colisiones
    const addMove = (tr, tc, stopOnCapture = true) => {
        if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE) {
            const target = board[tr][tc];
            if (!target) {
                moves.push({ r: tr, c: tc, capture: false });
                return true;
            } else if (target.color !== piece.color) {
                moves.push({ r: tr, c: tc, capture: true });
                return !stopOnCapture;
            }
        }
        return false; // Bloqueado (aliado o fuera de límites)
    };

    const dir = piece.color === 'white' ? -1 : 1;

    // 1. Peón / Sargento
    if (piece.type === 'pawn') {
        if (!piece.promoted) {
            if (!board[r + dir]?.[c]) addMove(r + dir, c);
            if (board[r + dir]?.[c - 1]?.color !== piece.color && board[r + dir]?.[c - 1]) addMove(r + dir, c - 1);
            if (board[r + dir]?.[c + 1]?.color !== piece.color && board[r + dir]?.[c + 1]) addMove(r + dir, c + 1);
        } else {
            const offsets = [{r: dir, c: 0}, {r: dir, c: -1}, {r: dir, c: 1}, {r: -dir, c: -1}, {r: -dir, c: 1}];
            offsets.forEach(off => addMove(r + off.r, c + off.c));
        }
    }

    // 2. Caballo / Cabellero Imperial
    else if (piece.type === 'knight') {
        const knightJumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        knightJumps.forEach(jmp => addMove(r + jmp[0], c + jmp[1]));
        if (piece.promoted) {
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

            // Estado Ascendido: Conserva cruz (1 casilla) y extiende TODAS las diagonales (hasta 2 casillas)
            
            // 1. Ortogonales (Adelante, Atrás, Izquierda, Derecha) - Máximo 1 casilla
            const orthoDirs = [{r: -1, c: 0}, {r: 1, c: 0}, {r: 0, c: -1}, {r: 0, c: 1}];
            orthoDirs.forEach(off => addMove(r + off.r, c + off.c));
            
            // 2. Diagonales (Las 4 direcciones) - Hasta 2 casillas
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
        const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
        dirs.forEach(d => {
            for(let i=1; i<=limit; i++) if(!addMove(r + d[0]*i, c + d[1]*i)) break;
        });
    }

    // 5. Torre / Torre de Asedio
    else if (piece.type === 'rook') {
        const limit = piece.promoted ? BOARD_SIZE : 2;
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        dirs.forEach(d => {
            for(let i=1; i<=limit; i++) if(!addMove(r + d[0]*i, c + d[1]*i)) break;
        });
    }

    // 6. Reina / Emperatriz
    else if (piece.type === 'queen') {
        if (!piece.promoted) {
            // Movimiento de Rey (1 casilla)
            for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++) if(dr!==0||dc!==0) addMove(r+dr, c+dc);
            
            // Carga especial: Si ve enemigo a lo lejos, puede capturar
            const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
            dirs.forEach(d => {
                let i = 1;
                while(true) {
                    const tr = r + d[0]*i, tc = c + d[1]*i;
                    if (tr < 0 || tr >= BOARD_SIZE || tc < 0 || tc >= BOARD_SIZE) break;
                    const target = board[tr][tc];
                    if (target) {
                        if (target.color !== piece.color) moves.push({r: tr, c: tc, capture: true});
                        break; // Detener visión
                    }
                    i++;
                }
            });
        } else {
            // Emperatriz: Alcance infinito total
            const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
            dirs.forEach(d => {
                for(let i=1; i<BOARD_SIZE; i++) if(!addMove(r + d[0]*i, c + d[1]*i)) break;
            });
        }
    }

    // 7. Rey
    else if (piece.type === 'king') {
        for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++) {
            if(dr !== 0 || dc !== 0) addMove(r+dr, c+dc);
        }

        // Enroque Imperial
        if (!ignoreCastling && !piece.hasMoved) {
            const opponentColor = piece.color === 'white' ? 'black' : 'white';
            
            // Condición principal: El Emperador no puede estar en jaque
            if (!isSquareAttacked(r, c, opponentColor)) {
                
                // Enroque Imperial Derecho (Rey a col 8, Vigía a col 7)
                const rightRook = board[r][9];
                if (rightRook && rightRook.type === 'rook' && !rightRook.hasMoved) {
                    
                    // Limpieza de Terreno (Columnas 6, 7 y 8 libres)
                    if (!board[r][6] && !board[r][7] && !board[r][8]) {
                        
                        // Inmunidad al trayecto y llegada
                        if (!isSquareAttacked(r, 6, opponentColor) && 
                            !isSquareAttacked(r, 7, opponentColor) && 
                            !isSquareAttacked(r, 8, opponentColor)) {
                            moves.push({ r: r, c: 8, capture: false });
                        }
                    }
                }

                // Enroque Imperial Izquierdo (Rey a col 1, Vigía a col 2)
                const leftRook = board[r][0];
                if (leftRook && leftRook.type === 'rook' && !leftRook.hasMoved) {
                    
                    // Limpieza de Terreno incluyendo el espacio de la Reina (Columnas 1, 2, 3 y 4)
                    if (!board[r][1] && !board[r][2] && !board[r][3] && !board[r][4]) {
                        // Inmunidad al trayecto y llegada
                        if (!isSquareAttacked(r, 1, opponentColor) && 
                            !isSquareAttacked(r, 2, opponentColor) && 
                            !isSquareAttacked(r, 3, opponentColor) && 
                            !isSquareAttacked(r, 4, opponentColor)) {
                            moves.push({ r: r, c: 1, capture: false });
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function executeMove(sr, sc, tr, tc) {
    const piece = board[sr][sc];
    if (!piece) return;
    const target = board[tr][tc];
    let msg = "";

    const state = {
        board: board.map(row => row.map(p => p ? {...p} : null)),
        turn: turn,
        capturedPawns: {...capturedPawns},
        lastMove: lastMove ? { from: {...lastMove.from}, to: {...lastMove.to} } : null
    };
    moveHistory.push(state);

    // Capturas
    if (target) {
        if (target.type === 'pawn') {
            capturedPawns[piece.color]++;
            
            // Contador de experiencia individual para la pieza
            if (['bishop', 'rook'].includes(piece.type) && !piece.promoted) {
                piece.kills = (piece.kills || 0) + 1;
                
                // Si alcanza 3 capturas, promueve y se limpia el contador de estrellas
                if (piece.kills >= 3) {
                    piece.promoted = true;
                    piece.kills = 0; // Se remueven las estrellas al cambiar a la nueva imagen
                    const name = piece.type === 'rook' ? 'Torre de Asedio' : 'Alfil Celestial';
                    msg = `Ascenso! ${name}`;
                } else {
                    msg = `Peon capturado! Exp: ${piece.kills}/3★`;
                }
            } else {
                msg = `Peon capturado por ${turn === 'white' ? 'Blancas' : 'Negras'}!`;
            }
        } else if (target.type === 'king') {
            board[tr][tc] = piece;
            board[sr][sc] = null;
            lastMove = { from: {r: sr, c: sc}, to: {r: tr, c: tc} };
            showMessage(`Jaque Mate! Ganan las ${turn === 'white' ? 'Blancas' : 'Negras'}.`);
            turn = 'none'; // Fin del juego
            updateHistoryUI(formatMoveNotation(sr, sc, tr, tc, piece, target));
            updateUI();
            renderBoard();
            return;
        }
    }

    // Reina -> Emperatriz por primera captura
    if (!piece.promoted && piece.type === 'queen' && target) {
        piece.promoted = true;
        msg = "La Reina asciende a Emperatriz!";
    }

    // Enroque
    if (piece.type === 'king' && Math.abs(tc - sc) > 1) {
        if (tc === 8) { // Ejecuta Enroque Derecho
            board[tr][7] = board[tr][9]; // Mueve el Vigía
            board[tr][9] = null;
            board[tr][7].hasMoved = true;
            msg = "Enroque Imperial Flanco Derecho!";
        } else if (tc === 1) { // Ejecuta Enroque Izquierdo
            board[tr][2] = board[tr][0]; // Mueve el Vigía
            board[tr][0] = null;
            board[tr][2].hasMoved = true;
            msg = "Enroque Imperial Flanco Izquierdo!";
        }
    }

    // Mover pieza
    const notation = formatMoveNotation(sr, sc, tr, tc, piece, target);
    board[tr][tc] = piece;
    board[sr][sc] = null;
    piece.hasMoved = true;
    lastMove = { from: {r: sr, c: sc}, to: {r: tr, c: tc} };

    // Promocion por territorio (ultimas 2 filas enemigas)
    if (!piece.promoted && ['pawn', 'knight', 'paladin'].includes(piece.type)) {
        if ((piece.color === 'white' && tr <= 1) || (piece.color === 'black' && tr >= 8)) {
            piece.promoted = true;
            const names = {pawn: 'Sargento', knight: 'Caballero Imperial', paladin: 'General Real'};
            msg = `${names[piece.type]} promovido por territorio!`;
        }
    }

    updateHistoryUI(notation);
    if (msg) showMessage(msg);
}

function undoMove() {
    if (moveHistory.length === 0) {
        showMessage("No hay movimientos para deshacer.");
        return;
    }
    const state = moveHistory.pop();
    board = state.board;
    turn = state.turn;
    capturedPawns = state.capturedPawns;
    lastMove = state.lastMove;
    selectedPiece = null;
    validMoves = [];
    moveHistoryText.pop(); // Actualizar historial visual (eliminar última entrada)
    updateHistoryUI(); // Sin parámetro, solo renderiza el array actual
    updateUI();
    renderBoard();
    showMessage("Movimiento deshecho.");
}

function switchTurn() {
    if (turn === 'none') return;
    turn = turn === 'white' ? 'black' : 'white';
    updateUI();
    renderBoard();

    const nextColor = turn;
    if (isCheckmate(nextColor)) {
        const winner = nextColor === 'white' ? 'Negras' : 'Blancas';
        showMessage(`Jaque Mate! Ganan las ${winner}.`);
        turn = 'none';
        updateUI();
        return;
    }
    if (isStalemate(nextColor)) {
        showMessage("Tablas por ahogado!");
        turn = 'none';
        updateUI();
        return;
    }
    if (isKingInCheck(nextColor)) {
        showMessage(`Jaque al Emperador ${nextColor === 'white' ? 'Blanco' : 'Negro'}!`);
    }

    // CPU turn
    if (gameMode === 'pvc' && turn === 'black' && turn !== 'none') {
        cpuThinking = true;
        updateUI();
        setTimeout(() => {
            const cpu = new ImperialCPU(3); // Dificultad 2 o 3, (4 máximo procesará muy lento)
            const move = cpu.getBestMove(board, 'black');
            if (move) {
                executeMove(move.from.r, move.from.c, move.to.r, move.to.c);
                if (turn !== 'none') {
                    switchTurn();
                }
            } else {
                showMessage("La CPU no encuentra movimiento. Tablas!");
                turn = 'none';
            }
            cpuThinking = false;
            updateUI();
            renderBoard();
        }, 400);
    }
}

function updateUI() {
    const turnText = document.getElementById('turn-text');
    const turnColor = document.getElementById('turn-indicator-color');
    if (!turnText || !turnColor) return;
    turnText.textContent = turn === 'none' ? 'Fin' : (turn === 'white' ? 'Blancas' : 'Negras');
    turnColor.className = `w-4 h-4 rounded-full border border-gray-400 ${turn === 'white' ? 'bg-white' : (turn === 'black' ? 'bg-[#111]' : 'bg-red-500')}`;
    document.getElementById('white-captures').textContent = capturedPawns.white;
    document.getElementById('black-captures').textContent = capturedPawns.black;
}

function showMessage(text) {
    const msgEl = document.getElementById('game-message');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.style.opacity = '0';
    setTimeout(() => msgEl.style.opacity = '1', 50);

    // Si es un mensaje transitorio, limpiarlo después de unos segundos (opcional)
    if(text !== "¡Partida iniciada!" && !text.includes("Ganan")) {
        setTimeout(() => {
            if(msgEl.textContent === text) msgEl.textContent = "";
        }, 3000);
    }
}

function getSquareNotation(r, c) {
    const yNum = (r < 5) ? 5 - r : r - 4;
    const yDir = (r < 5) ? 'N' : 'S';
    const xNum = (c < 5) ? 5 - c : c - 4;
    const xDir = (c < 5) ? 'O' : 'E';
    if (yNum === xNum) return `${yNum}${yDir}${xDir}`;
    return `${yNum}${yDir}${xNum}${xDir}`;
}

function getPieceSymbol(piece, c) {
    if (!piece) return '';
    const isEast = c >= 5;
    switch (piece.type) {
        case 'pawn': return piece.promoted ? 'S' : 'x';
        case 'rook': return piece.promoted ? 'T' : (isEast ? 'Ve' : 'Vo');
        case 'bishop': return piece.promoted ? (isEast ? 'Ae' : 'Ao') : (isEast ? 'Ee' : 'Eo');
        case 'knight': return piece.promoted ? 'Cr' : 'C';
        case 'paladin': return piece.promoted ? 'G' : 'P';
        case 'queen': return piece.promoted ? 'Q' : 'R';
        case 'king': return 'K';
        default: return '';
    }
}

function formatMoveNotation(sr, sc, tr, tc, piece, target) {
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

resetGame();