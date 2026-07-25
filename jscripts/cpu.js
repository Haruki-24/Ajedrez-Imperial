// Motor CPU para Ajedrez Imperial
// Algoritmo: Minimax con Poda Alfa-Beta
// Convertido y adaptado desde Java

class ImperialCPU {
    constructor(depth = 2) {
        this.depth = depth;
        this.values = {
            pawn: 100,
            sargento: 280,
            knight: 300,
            caballero: 550,
            paladin: 350,
            general_real: 600,
            bishop: 200,
            alfil: 330,
            rook: 450,
            torre: 500,
            queen: 300,
            emperatriz: 900,
            king: 10000
        };
    }

    getBestMove(gameBoard, color) {
        const originalBoard = board;
        // Clonar tablero para simulacion
        board = gameBoard.map(row => row.map(p => p ? {...p} : null));

        let bestMove = null;
        let bestValue = -Infinity;
        const moves = this.getAllLegalMoves(color);

        // Ordenar movimientos: capturas primero (mejora poda)
        moves.sort((a, b) => (b.capture ? 1 : 0) - (a.capture ? 1 : 0));

        for (const move of moves) {
            const state = this.makeMove(move);
            const value = this.minimax(this.depth - 1, -Infinity, Infinity, false, color);
            this.undoMove(state);

            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }

        board = originalBoard;
        return bestMove;
    }

    getAllLegalMoves(color) {
        const moves = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const p = board[r][c];
                if (p && p.color === color) {
                    const vm = getValidMoves(r, c, true);
                    for (const m of vm) {
                        const target = board[m.r][m.c];
                        board[m.r][m.c] = p;
                        board[r][c] = null;
                        const inCheck = isKingInCheck(color);
                        board[r][c] = p;
                        board[m.r][m.c] = target;
                        if (!inCheck) {
                            moves.push({
                                from: {r, c},
                                to: {r: m.r, c: m.c},
                                capture: !!target,
                                pieceType: p.type
                            });
                        }
                    }
                }
            }
        }
        return moves;
    }

    makeMove(move) {
        const piece = board[move.from.r][move.from.c];
        const target = board[move.to.r][move.to.c];
        const state = {
            from: move.from,
            to: move.to,
            piece: piece,
            target: target,
            promoted: piece.promoted,
            kills: piece.kills,
            hasMoved: piece.hasMoved,
            capturedPawns: {...capturedPawns}
        };

        board[move.to.r][move.to.c] = piece;
        board[move.from.r][move.from.c] = null;

        // Captura de peon -> contadores
        if (target && target.type === 'pawn') {
            capturedPawns[piece.color]++;
            if (['bishop', 'rook'].includes(piece.type) && !piece.promoted) {
                piece.kills = (piece.kills || 0) + 1;
                if (piece.kills >= 3) {
                    piece.promoted = true;
                    piece.kills = 0;
                }
            }
        }

        // Reina -> Emperatriz
        if (!piece.promoted && piece.type === 'queen' && target) {
            piece.promoted = true;
        }

        // Promocion por territorio (ultimas 2 filas)
        if (!piece.promoted && ['pawn', 'knight', 'paladin'].includes(piece.type)) {
            if ((piece.color === 'white' && move.to.r <= 1) || (piece.color === 'black' && move.to.r >= 8)) {
                piece.promoted = true;
            }
        }

        piece.hasMoved = true;
        return state;
    }

    undoMove(state) {
        const piece = board[state.to.r][state.to.c];
        board[state.from.r][state.from.c] = piece;
        board[state.to.r][state.to.c] = state.target;
        piece.promoted = state.promoted;
        piece.kills = state.kills;
        piece.hasMoved = state.hasMoved;
        capturedPawns = state.capturedPawns;
    }

    minimax(depth, alpha, beta, isMaximizing, cpuColor) {
        const currentColor = isMaximizing ? cpuColor : (cpuColor === 'white' ? 'black' : 'white');

        if (depth === 0) {
            return this.evaluate(cpuColor);
        }

        const moves = this.getAllLegalMoves(currentColor);

        if (moves.length === 0) {
            if (isKingInCheck(currentColor)) {
                return isMaximizing ? -100000 : 100000;
            }
            return 0; // Tablas por ahogado
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const state = this.makeMove(move);
                const eval_ = this.minimax(depth - 1, alpha, beta, false, cpuColor);
                this.undoMove(state);
                maxEval = Math.max(maxEval, eval_);
                alpha = Math.max(alpha, eval_);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const state = this.makeMove(move);
                const eval_ = this.minimax(depth - 1, alpha, beta, true, cpuColor);
                this.undoMove(state);
                minEval = Math.min(minEval, eval_);
                beta = Math.min(beta, eval_);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    evaluate(forColor) {
        let score = 0;
        const opponent = forColor === 'white' ? 'black' : 'white';

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const p = board[r][c];
                if (!p) continue;

                let value = this.values[p.type] || 0;

                // Bono por pieza promocionada
                if (p.promoted) {
                    if (p.type === 'pawn') value += 180;
                    else value += 150;
                }

                // Bono centro (filas 3-6, cols 3-6)
                if (r >= 3 && r <= 6 && c >= 3 && c <= 6) {
                    value += 15;
                }

                // Bono avance peones
                if (p.type === 'pawn') {
                    if (p.color === 'white') value += (9 - r) * 5;
                    else value += r * 5;
                }

                // Bono caballo/paladin cerca del centro en apertura
                if ((p.type === 'knight' || p.type === 'paladin') && !p.promoted) {
                    if (r >= 3 && r <= 6 && c >= 3 && c <= 6) value += 10;
                }

                // Penalizacion por pieza indefensa amenazada (simplificada)
                if (p.color === forColor) {
                    score += value;
                } else {
                    score -= value;
                }
            }
        }

        // Bono por capturas de peon acumuladas (caza para evolucion)
        score += (capturedPawns[forColor] || 0) * 30;
        score -= (capturedPawns[opponent] || 0) * 30;

        return score;
    }
}