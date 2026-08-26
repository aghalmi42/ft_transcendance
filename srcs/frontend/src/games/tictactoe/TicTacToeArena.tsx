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
    
    async function handleCellClick(index: number) {
        try {
            let res = await makeMove(gameState.gameId, index)
            setGameState(res)
        }
        catch (err) {
            console.log(err); // TO DO: affichage d'erreur
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
        <div>
            <p>{getStatusMessage()}</p>
            <TicTacToeBoard
                board={gameState.board}
                onCellClick={handleCellClick}
                disabled={!isMyTurn()}
            />
        </div>
    );
}