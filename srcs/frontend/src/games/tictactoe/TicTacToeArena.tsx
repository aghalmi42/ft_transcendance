import { useState } from "react";
import { useEffect } from "react";
import { makeMove } from "./api";
import { TicTacToeBoard } from "./TicTacToeBoard";
import type { TicTacToeState } from "./types";
import { useAuth } from "../../context/AuthContext";
import { getGame } from "./api"
import Button from "../../components/common/Button";

interface TicTacToeArenaProps {
    initialState: TicTacToeState;
}

export function TicTacToeArena({ initialState }: TicTacToeArenaProps) {
    const [gameState, setGameState] = useState<TicTacToeState>(initialState)
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null)
    
    useEffect(() => {
        if (gameState.status === 'finished' || gameState.status === 'draw')
            return;

        const intervalId = setInterval(() => {
            handleRefresh();
        }, 2000);

        return () => clearInterval(intervalId);
    }, [gameState.status]);

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
    async function handleRefresh() {
        try {
            let game = await getGame(gameState.gameId)
            setGameState(game)
        }
        catch (err) {
            if (err instanceof Error)
                setError(err.message)
            else
                setError("Une erreur inattendue est survenue")
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
            return "Égalité"
        if (gameState.status === 'finished'){
            if ((gameState.winner === 'X' && gameState.playerXId === user.id) || (gameState.winner === 'O' && gameState.playerOId === user.id))
                return "Vous avez gagné"
            else
                return "Vous avez perdu"
        }
        if (gameState.status === 'playing'){
            if (isMyTurn())
                return "À votre tour"
            else
                return "Au tour de votre adversaire"
        }
        if (gameState.status === 'waiting')
            return "En attente de votre adversaire"
    }
    return (
        <div className="max-w-md mx-auto space-y-6 text-center">
            <div className="px-4 py-2 rounded-full bg-slate-900 border border-violet-500/40 text-violet-300 font-bold text-sm inline-block">
                {getStatusMessage()}
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            {gameState.gameId && gameState.status === 'waiting' && <p className="text-xs text-emerald-400">Partagez ce code à votre ami: {gameState.gameId}</p>}
            <TicTacToeBoard
                board={gameState.board}
                onCellClick={handleCellClick}
                disabled={!isMyTurn()}
            />
            <div>
                <Button variant="neon" onClick={() => handleRefresh()}>Rafraîchir</Button>
            </div>
        </div>
    );
}