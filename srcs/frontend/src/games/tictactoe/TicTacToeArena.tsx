import { useState } from "react";
import { makeMove } from "./api";
import { TicTacToeBoard } from "./TicTacToeBoard";
import type { TicTacToeState } from "./types";
import { useAuth } from "../../context/AuthContext";

interface TicTacToeArenaProps {
    initialState: TicTacToeState;
}

export function TicTacToeArena({ initialState }: TicTacToeArenaProps) {
    const [gameState, setGameState] = useState<TicTacToeState>(initialState)
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null)
    
    async function handleCellClick(index: number) {
        try {
            let res = await makeMove(gameState.gameId, index)
            setGameState(res)
        }
        catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
            else
                setError("Une erreur inattendue est survenue.")
        }
    }
    function isMyTurn() {
        if (gameState.status !== 'playing')
            return false;
        if ((gameState.currentPlayer === 'X' && gameState.playerXId === user.id) || (gameState.currentPlayer === 'O' && gameState.playerOId === user.id))
            return true;
        else
            return false;
    }
    function getStatusMessage() {
        if (gameState.status === 'draw')
            return "You drew"
        if (gameState.status === 'finished'){
            if ((gameState.winner === 'X' && gameState.playerXId === user.id) || (gameState.winner === 'O' && gameState.playerOId === user.id))
                return "You won"
            else
                return "You lost"
        }
        if (gameState.status === 'playing'){
            if (isMyTurn())
                return "Your turn"
            else
                return "Opponent's turn"
        }
        if (gameState.status === 'waiting')
            return "Waiting for your opponent to join"
    }
    return (
        <div className="max-w-md mx-auto space-y-6 text-center">
            <div className="px-4 py-2 rounded-full bg-slate-900 border border-violet-500/40 text-violet-300 font-bold text-sm inline-block">
                {getStatusMessage()}
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <TicTacToeBoard
                board={gameState.board}
                onCellClick={handleCellClick}
                disabled={!isMyTurn()}
            />
        </div>
    );
}