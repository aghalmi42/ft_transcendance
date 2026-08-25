import { useState } from "react";
import { makeMove } from "./api";
import { TicTacToeBoard } from "./TicTacToeBoard";
import type { TicTacToeState } from "./types";

interface TicTacToeArenaProps {
    initialState: TicTacToeState;
}

export function TicTacToeArena({ initialState }: TicTacToeArenaProps) {
    const [gameState, setGameState] = useState<TicTacToeState>(initialState)
    
    async function handleCellClick(index: number) {
        try {
            let res = await makeMove(gameState.gameId, index)
            setGameState(res)
        }
        catch (err) {
            console.log(err); // TO DO: affichage d'erreur
        }
    }
    return (
        <div>
            <TicTacToeBoard
                board={gameState.board}
                onCellClick={handleCellClick}
                disabled={false}
            />
        </div>
    );
}