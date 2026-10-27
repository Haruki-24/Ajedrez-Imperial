// cpu.js — Motor de IA Ajedrez Imperial 10x10
// Tabla de Transposiciones (TT) + Zobrist Hashing incremental.
// Detección de repetición. Mutación controlada. API pública pura.

import {
    BOARD_SIZE,
    PIECE_VALUES,
    PROMOTION_BONUS,
    POSITION_BONUS,
    CPU_DIFFICULTY,
    PAWN_KILLERS,
    ZONE_PROMOTABLES,
    KILLS_TO_PROMOTE,
    PROMOTION_ZONE,
    getSquareNotation
} from './constants.js';

import {
    getAllLegalMovesState,
    isKingInCheckState,
    isSquareAttackedState
} from './game.js';

// CLASE IMPERIAL CPU
class ImperialCPU {
    constructor(config = {}) {
        this.timeLimit = config.timeLimit || 1000;
        this.depthLimit = config.depthLimit || 0;
        this.randomness = config.randomness !== undefined ? config.randomness : 0.12;

        this.openingBook = null;
        this.externalEvaluator = null;

        // Tabla de Transposiciones
        this.transpositionTable = null;
        this._ttMaxSize = 500000;
        this._ttAge = 0;

        // Zobrist keys (inicializadas lazy)
        this._zobrist = null;
        this._currentHash = 0n;
    }


    // ZOBRIST HASHING: Generacion de tablas para mejorar procesamiento de posiciones y detección de repeticiones
    _initZobrist() {
        if (this._zobrist) return;
        const rand64 = () => {
            const high = BigInt((Math.random() * 0xFFFFFFFF) | 0);
            const low  = BigInt((Math.random() * 0xFFFFFFFF) | 0);
            return (high << 32n) | low;
        };

        const types = ['pawn','knight','bishop','rook','paladin','queen','king'];
        const colors = ['white','black'];

        this._zobrist = {
            piece: {},
            turn: { white: rand64(), black: rand64() },
            captures: { white: Array(21).fill(0n).map(rand64), black: Array(21).fill(0n).map(rand64) }
        };

        for (const type of types) {
            this._zobrist.piece[type] = {};
            for (const color of colors) {
                this._zobrist.piece[type][color] = { false: [], true: [] };
                for (let r = 0; r < BOARD_SIZE; r++) {
                    this._zobrist.piece[type][color].false[r] = Array(BOARD_SIZE).fill(0n).map(rand64);
                    this._zobrist.piece[type][color].true[r]  = Array(BOARD_SIZE).fill(0n).map(rand64);
                }
            }
        }
    }

    _computeHash(boardState, turn, captures) {
        let hash = 0n;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const p = boardState[r][c];
                if (p) {
                    hash ^= this._zobrist.piece[p.type][p.color][p.promoted][r][c];
                }
            }
        }
        hash ^= this._zobrist.turn[turn];
        hash ^= this._zobrist.captures.white[captures.white || 0];
        hash ^= this._zobrist.captures.black[captures.black || 0];
        return hash;
    }


    // TABLA DE TRANSPOSICIONES
    enableTranspositionTable(maxSize = 500000) {
        this.transpositionTable = new Map();
        this._ttMaxSize = maxSize;
    }

    _ttGet(hash) {
        if (!this.transpositionTable) return null;
        return this.transpositionTable.get(hash.toString(16)) || null;
    }

    _ttStore(hash, depth, score, flag, bestMove) {
        if (!this.transpositionTable) return;
        const key = hash.toString(16);
        const existing = this.transpositionTable.get(key);
        // Reemplazo: si nueva profundidad es mayor, o si entrada vieja es de edad anterior
        if (!existing || existing.depth <= depth || existing.age < this._ttAge) {
            this.transpositionTable.set(key, { hash, depth, score, flag, bestMove, age: this._ttAge });
        }
        // Limpieza por tamaño (simple: clear cuando excede 2x)
        if (this.transpositionTable.size > this._ttMaxSize * 2) {
            this.transpositionTable.clear();
            this._ttAge++;
        }
    }


    // API PÚBLICA
    getBestMove(boardState, color, capturedPawnsState = { white: 0, black: 0 }, lastMoveState = null, positionHistory = []) {
        this._initZobrist();
        const startTime = Date.now();

        if (this.openingBook) {
            const bookMove = this.openingBook.findMove(boardState, color, lastMoveState);
            if (bookMove) {
                console.log('[CPU] Jugada de libro:', this._moveToString(bookMove));
                return bookMove;
            }
        }

        this._currentHash = this._computeHash(boardState, color, capturedPawnsState);
        const currentKey = this._currentHash.toString(16);
        const fullHistory = new Set(positionHistory);
        fullHistory.add(currentKey);

        let bestMove = null;
        let bestPartialInfo = null;

        for (let depth = 1; ; depth++) {
            if (this.depthLimit > 0 && depth > this.depthLimit) {
                console.log(`[CPU] Límite de profundidad (${this.depthLimit}).`);
                break;
            }

            const elapsed = Date.now() - startTime;
            const remaining = this.timeLimit - elapsed;

            if (bestPartialInfo && bestPartialInfo.depth >= 1) {
                const prevTime = bestPartialInfo.elapsed || 100;
                const estimated = prevTime * 4;
                if (estimated > remaining * 0.85) {
                    console.log(`[CPU] Estimación depth ${depth}: ~${estimated}ms > ${remaining}ms restantes. Abortando.`);
                    break;
                }
            }

            if (elapsed > this.timeLimit) {
                console.log(`[CPU] Tiempo agotado. Usando depth ${bestPartialInfo ? bestPartialInfo.depth : 0}.`);
                break;
            }

            const simBoard = this._cloneBoard(boardState);
            const simCaptures = { ...capturedPawnsState };
            this._currentHash = this._computeHash(simBoard, color, simCaptures);

            const result = this._minimaxRoot(simBoard, simCaptures, lastMoveState, color, depth, startTime, fullHistory);

            if (result && result.move) {
                bestMove = result.move;
                bestPartialInfo = { ...result, depth, elapsed: Date.now() - startTime };

                const now = Date.now() - startTime;
                const ttInfo = this.transpositionTable ? `| TT: ${this.transpositionTable.size}` : '';
                console.log(
                    `[CPU] Depth ${depth} | ${result.evaluated}/${result.total} movs | ` +
                    `Score: ${result.score.toFixed(1)} | ${this._moveToString(result.move)} | ` +
                    `${now}ms${result.partial ? ' [PARCIAL]' : ' [COMPLETO]'} ${ttInfo}`
                );

                if (!result.partial) continue;
                break;
            } else {
                console.log(`[CPU] Depth ${depth} sin resultados.`);
                break;
            }
        }

        if (bestMove && bestPartialInfo) {
            console.log(
                `[CPU] === RESULTADO === Depth: ${bestPartialInfo.depth} | ` +
                `Score: ${bestPartialInfo.score.toFixed(1)} | Mov: ${this._moveToString(bestMove)}`
            );
        }

        return bestMove;
    }

    setOpeningBook(book) { this.openingBook = book; }
    setExternalEvaluator(fn) { this.externalEvaluator = fn; }

    // DETECCIÓN DE REPETICIÓN
    _countRepetitions(positionKey, historySet) {
        let count = 0;
        for (const k of historySet) {
            if (k === positionKey) count++;
        }
        return count;
    }

    // MINIMAX ROOT
    _minimaxRoot(board, captures, lastMoveState, color, depth, startTime, positionHistory) {
        const moves = getAllLegalMovesState(board, color, lastMoveState);
        if (moves.length === 0) return null;

        // TT bestMove para ordenamiento
        const ttEntry = this._ttGet(this._currentHash);
        this._orderMoves(moves, board, ttEntry?.bestMove || null);

        let bestScore = -Infinity;
        let bestMoves = [];
        let evaluatedCount = 0;
        let partial = false;
        const alphaOrig = -Infinity;

        for (const move of moves) {
            if (Date.now() - startTime > this.timeLimit) {
                partial = true;
                break;
            }

            const undo = this._applyMove(board, captures, move, lastMoveState);
            const newLastMove = {
                from: { r: move.from.r, c: move.from.c },
                to: { r: move.to.r, c: move.to.c },
                pieceType: move.pieceType
            };

            const nextColor = color === 'white' ? 'black' : 'white';
            const newKey = this._currentHash.toString(16);
            const repCount = this._countRepetitions(newKey, positionHistory);

            let score = this._minimax(board, captures, newLastMove, depth - 1, -Infinity, Infinity, false, color, startTime, positionHistory);

            if (repCount >= 2) score -= 5000;
            else if (repCount === 1) score -= 150;

            this._revertMove(board, captures, undo);
            evaluatedCount++;

            const noise = (Math.random() - 0.5) * 2 * this.randomness * 50;
            const noisyScore = score + noise;

            if (noisyScore > bestScore) {
                bestScore = noisyScore;
                bestMoves = [move];
            } else if (Math.abs(noisyScore - bestScore) < 0.001) {
                bestMoves.push(move);
            }
        }

        if (bestMoves.length === 0) return null;

        const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        return {
            move: chosen,
            score: bestScore,
            partial: partial || evaluatedCount < moves.length,
            evaluated: evaluatedCount,
            total: moves.length
        };
    }


    // MINIMAX CON PODA ALFA-BETA + TT
    _minimax(board, captures, lastMoveState, depth, alpha, beta, isMaximizing, cpuColor, startTime, positionHistory) {
        const currentColor = isMaximizing ? cpuColor : (cpuColor === 'white' ? 'black' : 'white');

        if (Date.now() - startTime > this.timeLimit) {
            return this.evaluate(board, captures, cpuColor);
        }

        const posKey = this._currentHash.toString(16);
        if (this._countRepetitions(posKey, positionHistory) >= 2) return 0;

        // --- TT LOOKUP ---
        const ttEntry = this._ttGet(this._currentHash);
        if (ttEntry && ttEntry.depth >= depth) {
            if (ttEntry.flag === 'EXACT') return ttEntry.score;
            if (ttEntry.flag === 'LOWER' && ttEntry.score >= beta) return ttEntry.score;
            if (ttEntry.flag === 'UPPER' && ttEntry.score <= alpha) return ttEntry.score;
        }

        if (depth === 0) {
            if (this.externalEvaluator) {
                const ext = this.externalEvaluator(board, captures, cpuColor);
                if (ext !== null) return ext;
            }
            return this.evaluate(board, captures, cpuColor);
        }

        const moves = getAllLegalMovesState(board, currentColor, lastMoveState);
        if (moves.length === 0) {
            if (isKingInCheckState(board, currentColor, lastMoveState)) {
                return isMaximizing ? -50000 : 50000;
            }
            return 0;
        }

        this._orderMoves(moves, board, ttEntry?.bestMove || null);

        let bestMoveForTT = null;
        let alphaOrig = alpha;

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const undo = this._applyMove(board, captures, move, lastMoveState);
                const newLastMove = {
                    from: { r: move.from.r, c: move.from.c },
                    to: { r: move.to.r, c: move.to.c },
                    pieceType: move.pieceType
                };
                const eval_ = this._minimax(board, captures, newLastMove, depth - 1, alpha, beta, false, cpuColor, startTime, positionHistory);
                this._revertMove(board, captures, undo);

                if (eval_ > maxEval) {
                    maxEval = eval_;
                    bestMoveForTT = move;
                }
                alpha = Math.max(alpha, eval_);
                if (beta <= alpha) break;
            }

            // TT STORE
            let flag = 'EXACT';
            if (maxEval <= alphaOrig) flag = 'UPPER';
            else if (maxEval >= beta) flag = 'LOWER';
            this._ttStore(this._currentHash, depth, maxEval, flag, bestMoveForTT);

            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const undo = this._applyMove(board, captures, move, lastMoveState);
                const newLastMove = {
                    from: { r: move.from.r, c: move.from.c },
                    to: { r: move.to.r, c: move.to.c },
                    pieceType: move.pieceType
                };
                const eval_ = this._minimax(board, captures, newLastMove, depth - 1, alpha, beta, true, cpuColor, startTime, positionHistory);
                this._revertMove(board, captures, undo);

                if (eval_ < minEval) {
                    minEval = eval_;
                    bestMoveForTT = move;
                }
                beta = Math.min(beta, eval_);
                if (beta <= alpha) break;
            }

            let flag = 'EXACT';
            if (minEval <= alpha) flag = 'UPPER';
            else if (minEval >= beta) flag = 'LOWER';
            this._ttStore(this._currentHash, depth, minEval, flag, bestMoveForTT);

            return minEval;
        }
    }

    // MUTACIÓN CONTROLADA + HASH INCREMENTAL
    _applyMove(board, captures, move, lastMoveState) {
        const piece = board[move.from.r][move.from.c];
        const target = board[move.to.r][move.to.c];
        const prevHash = this._currentHash;

        // 1. Quitar pieza de origen
        this._currentHash ^= this._zobrist.piece[piece.type][piece.color][piece.promoted][move.from.r][move.from.c];

        // 2. Quitar target de destino si existe
        if (target) {
            this._currentHash ^= this._zobrist.piece[target.type][target.color][target.promoted][move.to.r][move.to.c];
        }

        // Mutaciones al tablero
        board[move.to.r][move.to.c] = piece;
        board[move.from.r][move.from.c] = null;

        // Enroque
        let castlingRookFrom = null;
        let castlingRookTo = null;
        let castlingRookPiece = null;
        let castlingRookHasMoved = null;

        if (piece.type === 'king' && Math.abs(move.to.c - move.from.c) > 1) {
            if (move.to.c === 8) {
                castlingRookFrom = { r: move.to.r, c: 9 };
                castlingRookTo = { r: move.to.r, c: 7 };
                castlingRookPiece = board[move.to.r][9];
                castlingRookHasMoved = board[move.to.r][9]?.hasMoved ?? false;

                this._currentHash ^= this._zobrist.piece[castlingRookPiece.type][castlingRookPiece.color][castlingRookPiece.promoted][move.to.r][9];
                this._currentHash ^= this._zobrist.piece[castlingRookPiece.type][castlingRookPiece.color][castlingRookPiece.promoted][move.to.r][7];

                board[move.to.r][7] = board[move.to.r][9];
                board[move.to.r][9] = null;
                if (board[move.to.r][7]) board[move.to.r][7].hasMoved = true;
            } else if (move.to.c === 1) {
                castlingRookFrom = { r: move.to.r, c: 0 };
                castlingRookTo = { r: move.to.r, c: 2 };
                castlingRookPiece = board[move.to.r][0];
                castlingRookHasMoved = board[move.to.r][0]?.hasMoved ?? false;

                this._currentHash ^= this._zobrist.piece[castlingRookPiece.type][castlingRookPiece.color][castlingRookPiece.promoted][move.to.r][0];
                this._currentHash ^= this._zobrist.piece[castlingRookPiece.type][castlingRookPiece.color][castlingRookPiece.promoted][move.to.r][2];

                board[move.to.r][2] = board[move.to.r][0];
                board[move.to.r][0] = null;
                if (board[move.to.r][2]) board[move.to.r][2].hasMoved = true;
            }
        }

        // En passant
        let enPassantCaptured = null;
        if (!target && piece.type === 'pawn' && Math.abs(move.to.c - move.from.c) === 1) {
            const capturedRow = piece.color === 'white' ? move.to.r + 1 : move.to.r - 1;
            if (capturedRow >= 0 && capturedRow < BOARD_SIZE) {
                const ep = board[capturedRow][move.to.c];
                if (ep && ep.type === 'pawn' && ep.color !== piece.color) {
                    enPassantCaptured = { r: capturedRow, c: move.to.c, piece: ep };
                    this._currentHash ^= this._zobrist.piece[ep.type][ep.color][ep.promoted][capturedRow][move.to.c];
                    board[capturedRow][move.to.c] = null;
                }
            }
        }

        // Capturas de peón
        const oldCapturesWhite = captures.white;
        const oldCapturesBlack = captures.black;
        const capturedIsPawn = target?.type === 'pawn' || enPassantCaptured?.piece?.type === 'pawn';

        if (capturedIsPawn) {
            this._currentHash ^= this._zobrist.captures[piece.color][captures[piece.color]];
            captures[piece.color]++;
            this._currentHash ^= this._zobrist.captures[piece.color][captures[piece.color]];

            if (PAWN_KILLERS.includes(piece.type) && !piece.promoted) {
                piece.kills = (piece.kills || 0) + 1;
                if (piece.kills >= KILLS_TO_PROMOTE) {
                    piece.promoted = true;
                    piece.kills = 0;
                }
            }
        }

        // Promoción Reina
        const oldPromoted = piece.promoted;
        if (!piece.promoted && piece.type === 'queen' && (target || enPassantCaptured)) {
            piece.promoted = true;
        }

        // Promoción por territorio
        const oldKills = piece.kills;
        const oldHasMoved = piece.hasMoved;
        if (!piece.promoted && ZONE_PROMOTABLES.includes(piece.type)) {
            const inZone = (piece.color === 'white' && move.to.r <= PROMOTION_ZONE.white.maxRow) ||
                           (piece.color === 'black' && move.to.r >= PROMOTION_ZONE.black.minRow);
            if (inZone) piece.promoted = true;
        }

        piece.hasMoved = true;

        // 3. Poner pieza en destino (con posible nuevo estado promoted)
        this._currentHash ^= this._zobrist.piece[piece.type][piece.color][piece.promoted][move.to.r][move.to.c];

        // 4. Cambiar turno en hash
        const nextTurn = piece.color === 'white' ? 'black' : 'white';
        this._currentHash ^= this._zobrist.turn[piece.color];
        this._currentHash ^= this._zobrist.turn[nextTurn];

        return {
            from: move.from, to: move.to,
            piece, target,
            promoted: oldPromoted, kills: oldKills, hasMoved: oldHasMoved,
            capturedPawnsWhite: oldCapturesWhite, capturedPawnsBlack: oldCapturesBlack,
            enPassantCaptured,
            castlingRookFrom, castlingRookTo, castlingRookPiece, castlingRookHasMoved,
            prevHash
        };
    }

    _revertMove(board, captures, undo) {
        // Restaurar hash
        this._currentHash = undo.prevHash;

        const piece = board[undo.to.r][undo.to.c];
        board[undo.from.r][undo.from.c] = piece;
        board[undo.to.r][undo.to.c] = undo.target;

        piece.promoted = undo.promoted;
        piece.kills = undo.kills;
        piece.hasMoved = undo.hasMoved;

        captures.white = undo.capturedPawnsWhite;
        captures.black = undo.capturedPawnsBlack;

        if (undo.enPassantCaptured) {
            board[undo.enPassantCaptured.r][undo.enPassantCaptured.c] = undo.enPassantCaptured.piece;
        }

        if (undo.castlingRookFrom) {
            board[undo.castlingRookFrom.r][undo.castlingRookFrom.c] = undo.castlingRookPiece;
            board[undo.castlingRookTo.r][undo.castlingRookTo.c] = null;
            if (undo.castlingRookPiece) {
                undo.castlingRookPiece.hasMoved = undo.castlingRookHasMoved;
            }
        }
    }


    // ORDENAMIENTO MVV-LVA + TT BEST MOVE
    _orderMoves(moves, boardState, ttBestMove) {
        // Si TT tiene un bestMove, ponerlo primero (killer heuristic)
        if (ttBestMove) {
            const idx = moves.findIndex(m =>
                m.from.r === ttBestMove.from.r && m.from.c === ttBestMove.from.c &&
                m.to.r === ttBestMove.to.r && m.to.c === ttBestMove.to.c
            );
            if (idx > 0) {
                [moves[0], moves[idx]] = [moves[idx], moves[0]];
            }
        }

        moves.sort((a, b) => {
            const capA = a.capture ? 1 : 0;
            const capB = b.capture ? 1 : 0;
            if (capA !== capB) return capB - capA;

            if (a.capture && b.capture) {
                const victimA = PIECE_VALUES[boardState[a.to.r][a.to.c]?.type] || 0;
                const victimB = PIECE_VALUES[boardState[b.to.r][b.to.c]?.type] || 0;
                const aggressorA = PIECE_VALUES[a.pieceType] || 0;
                const aggressorB = PIECE_VALUES[b.pieceType] || 0;
                const scoreA = victimA * 10 - aggressorA;
                const scoreB = victimB * 10 - aggressorB;
                return scoreB - scoreA;
            }
            return 0;
        });
    }


    // EVALUACIÓN
    evaluate(boardState, captures, forColor) {
        let score = 0;
        const opponent = forColor === 'white' ? 'black' : 'white';

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const p = boardState[r][c];
                if (!p) continue;

                let value = PIECE_VALUES[p.type] || 0;
                if (p.promoted) value += PROMOTION_BONUS[p.type] || 0;
                if (r >= 3 && r <= 6 && c >= 3 && c <= 6) value += POSITION_BONUS.center;
                if (p.type === 'pawn') {
                    value += (p.color === 'white' ? (9 - r) : r) * POSITION_BONUS.pawnAdvance;
                }
                if ((p.type === 'knight' || p.type === 'paladin') && !p.promoted) {
                    if (r >= 3 && r <= 6 && c >= 3 && c <= 6) value += POSITION_BONUS.knightCenter;
                }
                if (p.type === 'queen' && !p.promoted) {
                    value += this.getQueenThreatBonus(boardState, r, c, p.color);
                }
                score += (p.color === forColor ? value : -value);
            }
        }

        score += (captures[forColor] || 0) * POSITION_BONUS.pawnKillProgress;
        score -= (captures[opponent] || 0) * POSITION_BONUS.pawnKillProgress;
        return score;
    }

    getQueenThreatBonus(boardState, r, c, color) {
        const opponent = color === 'white' ? 'black' : 'white';
        let safeCaptureBonus = 0;
        let escapeBonus = 0;
        const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];

        for (const [dr, dc] of dirs) {
            let dist = 1;
            while (dist < BOARD_SIZE) {
                const tr = r + dr * dist;
                const tc = c + dc * dist;
                if (tr < 0 || tr >= BOARD_SIZE || tc < 0 || tc >= BOARD_SIZE) break;
                const p = boardState[tr][tc];
                if (p) {
                    if (p.color === opponent) {
                        const defended = isSquareAttackedState(boardState, tr, tc, opponent);
                        const targetValue = PIECE_VALUES[p.type] || 0;
                        if (!defended) safeCaptureBonus += 500 + targetValue * 0.5;
                        else if (p.type === 'king') safeCaptureBonus += 8000;
                    }
                    break;
                }
                dist++;
            }
        }

        const queenAttacked = isSquareAttackedState(boardState, r, c, opponent);
        if (queenAttacked) {
            let safeSquares = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
                    if (!boardState[nr][nc] && !isSquareAttackedState(boardState, nr, nc, opponent)) safeSquares++;
                }
            }
            escapeBonus += (safeSquares === 0) ? POSITION_BONUS.queenTrapped : POSITION_BONUS.queenEscape;
        } else {
            escapeBonus += POSITION_BONUS.queenSafe;
        }

        const p = boardState[r][c];
        if (p && p.hasMoved) escapeBonus += POSITION_BONUS.queenActivity;

        return Math.min(safeCaptureBonus, 1300) + escapeBonus;
    }


    // UTILIDADES
    _cloneBoard(boardState) {
        return boardState.map(row => row.map(p => p ? { ...p } : null));
    }

    _moveToString(move) {
        return `${getSquareNotation(move.from.r, move.from.c)} → ${getSquareNotation(move.to.r, move.to.c)}`;
    }
}

// FACTORY
export function createCPU(difficultyKey) {
    const config = CPU_DIFFICULTY[difficultyKey] || CPU_DIFFICULTY.medio;
    return new ImperialCPU(config);
}
