
// CPU.JS - Motor Imperial con Iterative Deepening + Partial Results
// game.js (debe cargarse ANTES que este archivo)

class ImperialCPU {
    constructor(config = {}) {
        this.timeLimit = config.timeLimit || 1000;
        this.depthLimit = config.depthLimit || 0;
        this.randomness = config.randomness !== undefined ? config.randomness : 0.12;

        this.values = {
            pawn: 100, 
            sargento: 280, 
            knight: 350, 
            caballero: 550,
            paladin: 450, 
            general_real: 700, 
            bishop: 250, 
            alfil: 330,
            rook: 400, 
            torre: 500, 
            queen: 600, 
            emperatriz: 2000, 
            king: 10000
        };
    }

 
    // ENTRADA PRINCIPAL
 
    getBestMove(gameBoard, color) {
        const originalBoard = board;
        // Clonar tablero para simulacion
        board = gameBoard.map(function(row) {
            return row.map(function(p) { return p ? Object.assign({}, p) : null; });
        });

        const startTime = Date.now();
        let bestMove = null;
        let bestPartialInfo = null;

        for (let depth = 1; ; depth++) {
            // Limite de profundidad explicito
            if (this.depthLimit > 0 && depth > this.depthLimit) {
                console.log('[CPU] Limite de profundidad alcanzado (' + this.depthLimit + ').');
                break;
            }

            // verificaicon de timeLimit, para no seguir intentando
            const elapsedBefore = Date.now() - startTime;
            if (elapsedBefore > this.timeLimit) {
                console.log('[CPU] Tiempo total agotado (' + elapsedBefore + 'ms > ' + this.timeLimit + 'ms). ' +
                    'Usando mejor resultado disponible de depth ' + (bestPartialInfo ? bestPartialInfo.depth : 0));
                break;
            }

            // Intentar con profundidad establecida. minimaxRoot se encarga de cortar por tiempo internamente.
            const result = this.minimaxRoot(color, depth, startTime);

            if (result && result.move) {
                // Guardamos este resultado (hipotesis: siempre es mejor que el anterior porque es depth mayor)
                bestMove = result.move;
                bestPartialInfo = result;
                bestPartialInfo.depth = depth;

                const elapsedAfter = Date.now() - startTime;
                console.log(
                    '[CPU] Depth ' + depth + ' | ' +
                    'Evaluados: ' + result.evaluated + '/' + result.total + ' movimientos | ' +
                    'Mejor score: ' + result.score.toFixed(1) + ' | ' +
                    'Elegido: ' + this.moveToString(result.move) + ' | ' +
                    'Tiempo usado: ' + elapsedAfter + 'ms' +
                    (result.partial ? ' [PARCIAL]' : ' [COMPLETA]')
                );

                // Si fue completa, intentamos la siguiente profundidad
                if (!result.partial) {
                    continue;
                }

                // Si fue parcial, la usamos como mejor resultado y paramos
                console.log('[CPU] Depth ' + depth + ' fue parcial. Fin de busqueda.');
                break;
            } else {
                // No pudo evaluar NINGUN movimiento de esta profundidad (tiempo se acabo antes del primero)
                console.log('[CPU] Depth ' + depth + ' no pudo evaluar ningun movimiento. ' +
                    'Usando mejor resultado de depth ' + (bestPartialInfo ? bestPartialInfo.depth : 0));
                break;
            }
        }

        board = originalBoard;

        if (bestMove && bestPartialInfo) {
            console.log(
                '[CPU] === RESULTADO FINAL === | ' +
                'Depth: ' + bestPartialInfo.depth + ' | ' +
                'Movimientos evaluados: ' + bestPartialInfo.evaluated + '/' + bestPartialInfo.total + ' | ' +
                'Score: ' + bestPartialInfo.score.toFixed(1) + ' | ' +
                'Movimiento: ' + this.moveToString(bestMove)
            );
        }

        return bestMove;
    }

    moveToString(move) {
        return getSquareNotation(move.from.r, move.from.c) + ' -> ' + getSquareNotation(move.to.r, move.to.c);
    }

    estimateTimeForDepth(depth) {
        const base = 15;
        return base * Math.pow(6, depth - 1);
    }


    // MINIMAX ROOT - con partial results y aleatoriedad

    minimaxRoot(color, depth, startTime) {
        const moves = this.getAllLegalMoves(color);
        if (moves.length === 0) return null;

        let bestScore = -Infinity;
        let bestMoves = [];
        let evaluatedCount = 0;
        let partial = false;

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];

            // CHECK DE TIEMPO ANTES DE CADA MOVIMIENTO RAIZ
            const elapsed = Date.now() - startTime;
            if (elapsed > this.timeLimit) {
                console.log(
                    '[CPU] Depth ' + depth + ' PARCIAL | ' +
                    'Tiempo agotado tras ' + evaluatedCount + '/' + moves.length + ' movimientos | ' +
                    'Faltaron: ' + (moves.length - evaluatedCount)
                );
                partial = true;
                break;
            }

            const state = this.makeMove(move);
            const score = this.minimax(depth - 1, -Infinity, Infinity, false, color, startTime);
            this.undoMove(state);
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

        if (bestMoves.length === 0) {
            // No evaluo ninguno (tiempo se acabo antes del primer movimiento)
            return null;
        }

        const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        return {
            move: chosen,
            score: bestScore,
            partial: partial || evaluatedCount < moves.length,
            evaluated: evaluatedCount,
            total: moves.length
        };
    }

    // MINIMAX con Poda Alfa-Beta

    minimax(depth, alpha, beta, isMaximizing, cpuColor, startTime) {
        const currentColor = isMaximizing ? cpuColor : (cpuColor === 'white' ? 'black' : 'white');

        // Check de tiempo de emergencia: si se acabo el tiempo, devolvemos evaluacion inmediata
        if (startTime && (Date.now() - startTime > this.timeLimit)) {
            return this.evaluate(cpuColor);
        }

        if (depth === 0) {
            return this.evaluate(cpuColor);
        }

        const moves = this.getAllLegalMoves(currentColor);

        if (moves.length === 0) {
            if (isKingInCheck(currentColor)) {
                return isMaximizing ? -50000 : 50000;
            }
            return 0;
        }

        moves.sort(function(a, b) {
            return (b.capture ? 1 : 0) - (a.capture ? 1 : 0);
        });

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                const state = this.makeMove(moves[i]);
                const eval_ = this.minimax(depth - 1, alpha, beta, false, cpuColor, startTime);
                this.undoMove(state);
                maxEval = Math.max(maxEval, eval_);
                alpha = Math.max(alpha, eval_);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < moves.length; i++) {
                const state = this.makeMove(moves[i]);
                const eval_ = this.minimax(depth - 1, alpha, beta, true, cpuColor, startTime);
                this.undoMove(state);
                minEval = Math.min(minEval, eval_);
                beta = Math.min(beta, eval_);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }


    // MOVIMIENTOS LEGALES

    getAllLegalMoves(color) {
        const moves = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const p = board[r][c];
                if (p && p.color === color) {
                    const vm = getValidMoves(r, c, true);
                    for (let i = 0; i < vm.length; i++) {
                        const m = vm[i];
                        const target = board[m.r][m.c];
                        board[m.r][m.c] = p;
                        board[r][c] = null;
                        const inCheck = isKingInCheck(color);
                        board[r][c] = p;
                        board[m.r][m.c] = target;
                        if (!inCheck) {
                            moves.push({
                                from: { r: r, c: c },
                                to: { r: m.r, c: m.c },
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


    // SIMULACION

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
            capturedPawns: { white: capturedPawns.white, black: capturedPawns.black }
        };

        board[move.to.r][move.to.c] = piece;
        board[move.from.r][move.from.c] = null;

        // Captura de peon -> contadores
        if (target && target.type === 'pawn') {
            capturedPawns[piece.color]++;
            if ((piece.type === 'bishop' || piece.type === 'rook') && !piece.promoted) {
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
        if (!piece.promoted && (piece.type === 'pawn' || piece.type === 'knight' || piece.type === 'paladin')) {
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

   
    // EVALUACION

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

                // Bono especial para Reina base: valor potencial a Emperatriz
                if (p.type === 'queen' && !p.promoted) {
                    const threatBonus = this.getQueenThreatBonus(r, c, p.color);
                    value += threatBonus;
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

   
    // Bono Reina por valor potencial a Emperatriz

    // La Reina puede ascender con CUALQUIER captura.
    // Si tiene piezas enemigas alineadas, su valor se acerca al de Emperatriz.
    getQueenThreatBonus(r, c, color) {
        const opponent = color === 'white' ? 'black' : 'white';
        let safeCaptureBonus = 0;
        let escapeBonus = 0;

        const dirs = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];

        // 1. Escanear amenazas de captura SEGURA (piezas enemigas alineadas no defendidas)
        // Estas son capturas limpias: la Reina captura y sobrevive.
        for (let i = 0; i < dirs.length; i++) {
            const d = dirs[i];
            let dist = 1;
            while (dist < BOARD_SIZE) {
                const tr = r + d[0] * dist;
                const tc = c + d[1] * dist;
                if (tr < 0 || tr >= BOARD_SIZE || tc < 0 || tc >= BOARD_SIZE) break;

                const p = board[tr][tc];
                if (p) {
                    if (p.color === opponent) {
                        const targetIsDefended = isSquareAttacked(tr, tc, opponent);
                        const targetValue = this.values[p.type] || 0;

                        if (!targetIsDefended) {
                            // CAPTURA LIMPIA: Reina captura y sobrevive -> ascenso a Emperatriz
                            safeCaptureBonus += 500 + targetValue * 0.5;
                        } else if (p.type === 'king') {
                            // La Reina puede capturar al Emperador (jaque mate)
                            safeCaptureBonus += 8000;
                        }
                        // NOTA: No se penaliza capturas a piezas defendidas.
                        // El minimax con suficiente profundidad ya detecta si el sacrificio
                        // lleva a jaque mate (ej: Reina x Torre -> Rey recaptura -> Torre#).
                        // Si la profundidad no alcanza a ver el mate, es preferible no arriesgar.
                    }
                    break;
                }
                dist++;
            }
        }

        // 2. Verificar si la propia Reina esta amenazada
        const queenIsAttacked = isSquareAttacked(r, c, opponent);
        if (queenIsAttacked) {
            let safeSquares = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
                    if (!board[nr][nc] && !isSquareAttacked(nr, nc, opponent)) {
                        safeSquares++;
                    }
                }
            }

            if (safeSquares === 0) {
                // JAQUE sin escapatoria: penalizacion masiva para que minimax la evite
                escapeBonus -= 3000;
            } else {
                // Amenazada pero puede escapar: penalizacion leve para incentivar huida
                escapeBonus -= 200;
            }
        } else {
            // Reina segura: bono por posicion solida
            escapeBonus += 50;
        }

        // 3. Bono por actividad
        const p = board[r][c];
        if (p && p.hasMoved) {
            escapeBonus += 40;
        }

        // El bono de captura segura nunca superara el valor de Emperatriz
        safeCaptureBonus = Math.min(safeCaptureBonus, 1300);

        return safeCaptureBonus + escapeBonus;
    }
}


// PRESETS DE DIFICULTAD (ajustados por el usuario)

const CPU_DIFFICULTY = {
    facil:    { timeLimit: 300,  depthLimit: 2, randomness: 0.35 },
    medio:    { timeLimit: 600,  depthLimit: 3, randomness: 0.15 },
    dificil:  { timeLimit: 3500, depthLimit: 4, randomness: 0.05 },
    maestro:  { timeLimit: 4000, depthLimit: 6, randomness: 0.0  }
};

function createCPU(difficultyKey) {
    const config = CPU_DIFFICULTY[difficultyKey] || CPU_DIFFICULTY.medio;
    return new ImperialCPU(config);
}
