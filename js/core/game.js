// core/game.js — Motor de Reglas Puro (Open Core)
// Arquitectura ES6. Sin dependencias del DOM.
// Recibe estados, calcula movimientos legales y devuelve datos puros.

import {
    BOARD_SIZE,
    PROMOTION_ZONE,
    PAWN_KILLERS,
    ZONE_PROMOTABLES,
    KILLS_TO_PROMOTE,
    STARTING_BACK_ROW,
    MOVEMENT_VECTORS
} from './constants.js';

// ============================================================
// ESTADO INICIAL (Factory Function)
// ============================================================
export function createInitialBoard() {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = createPiece(STARTING_BACK_ROW[c], 'black');
        board[1][c] = createPiece('pawn', 'black');
        board[8][c] = createPiece('pawn', 'white');
        board[9][c] = createPiece(STARTING_BACK_ROW[c], 'white');
    }
    return board;
}

function createPiece(type, color) {
    return { type, color, promoted: false, kills: 0, hasMoved: false };
}

// ============================================================
// MOTOR DE MOVIMIENTOS (FUNCIONES PURAS)
// ============================================================

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
    const lm = lastMoveState;

    // 1. Peón / Sargento
    if (piece.type === 'pawn') {
        if (!piece.promoted) {
            const startRow = piece.color === 'white' ? 8 : 1;
            if (!boardState[r + dir]?.[c]) {
                addMove(r + dir, c);
                if (r === startRow && !boardState[r + dir * 2]?.[c]) {
                    addMove(r + dir * 2, c);
                }
            }
            if (boardState[r + dir]?.[c - 1]?.color !== piece.color && boardState[r + dir]?.[c - 1]) addMove(r + dir, c - 1);
            if (boardState[r + dir]?.[c + 1]?.color !== piece.color && boardState[r + dir]?.[c + 1]) addMove(r + dir, c + 1);

            // En passant
            if (lm && lm.pieceType === 'pawn' && Math.abs(lm.from.r - lm.to.r) === 2) {
                if (lm.to.r === r && Math.abs(lm.to.c - c) === 1) {
                    const passantR = (lm.from.r + lm.to.r) / 2;
                    moves.push({ r: passantR, c: lm.to.c, capture: true, enPassant: true });
                }
            }
        } else {
            const offsets = [{r: dir, c: 0}, {r: dir, c: -1}, {r: dir, c: 1}, {r: -dir, c: -1}, {r: -dir, c: 1}];
            offsets.forEach(off => addMove(r + off.r, c + off.c));
        }
    }

    // 2. Caballo / Caballero Imperial
    else if (piece.type === 'knight') {
        MOVEMENT_VECTORS.knight.jumps.forEach(jmp => addMove(r + jmp[0], c + jmp[1]));
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
            MOVEMENT_VECTORS.queen.directions.forEach(d => addMove(r + d[0], c + d[1]));
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
            MOVEMENT_VECTORS.queen.directions.forEach(d => {
                for(let i=1; i<BOARD_SIZE; i++) if(!addMove(r + d[0]*i, c + d[1]*i)) break;
            });
        }
    }

    // 7. Rey / Emperador (Enroque)
    else if (piece.type === 'king') {
        MOVEMENT_VECTORS.king.directions.forEach(d => addMove(r + d[0], c + d[1]));

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

function simulateMove(boardState, sr, sc, tr, tc, lastMoveState = null) {
    const sim = boardState.map(row => row.map(p => p ? { ...p } : null));
    const piece = sim[sr][sc];
    sim[tr][tc] = piece;
    sim[sr][sc] = null;

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

export function isSquareAttackedState(boardState, r, c, byColor, lastMoveState = null) {
    const lm = lastMoveState;

    // 1. Peones
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

    // 2. Caballos
    for (const [dr, dc] of MOVEMENT_VECTORS.knight.jumps) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const p = boardState[nr][nc];
            if (p && p.color === byColor && p.type === 'knight') return true;
        }
    }

    // 3. Rey y Paladín base
    for (const [dr, dc] of MOVEMENT_VECTORS.king.directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const p = boardState[nr][nc];
            if (p && p.color === byColor && (p.type === 'king' || p.type === 'paladin')) return true;
        }
    }

    // 4. Deslizantes
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
                    break;
                }
                dist++;
            }
        }
    }

    // 5. Caballero Imperial
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const p = boardState[nr][nc];
            if (p && p.color === byColor && p.type === 'knight' && p.promoted) return true;
        }
    }

    // 6. General Imperial
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

// ============================================================
// UTILIDADES PURAS
// ============================================================
export function formatMoveNotation(sr, sc, tr, tc, piece, target) {
    // Esta función ahora es pura. La UI puede formatear la notación con sus propias reglas de símbolos.
    // Aquí devolvemos un objeto con los datos crudos, o un string básico si no hay símbolos.
    // Para mantener compatibilidad con el frontend, devolvemos la notación en texto.
    // Pero los símbolos (getPieceSymbol) se manejarán en render.js o translate.js.
    const fromCoord = `${sr},${sc}`;
    const toCoord = `${tr},${tc}`;
    const actionSymbol = target ? 'X' : '->';
    return `[${fromCoord}] ${actionSymbol} [${toCoord}]`;
}

function opp(color) {
    return color === 'white' ? 'black' : 'white';
}