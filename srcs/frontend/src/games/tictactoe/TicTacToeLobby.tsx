import { useState } from "react";
import { useEffect } from "react";
import type { User } from "../../types";
import type { TicTacToeState } from "./types";
import { createGame, getGame, joinGame } from "./api";
import { api } from "../../services/api";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { TicTacToeArena } from "./TicTacToeArena";

export function TicTacToeLobby() {
    const [friendsList, setFriendsList] = useState<User[]>([])
    const [joinInput, setJoinInput] = useState<string>("")
    const [gameState, setGameState] = useState<TicTacToeState | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [gameId, setGameId] = useState<string | null>(null)

    useEffect(() => {
        async function fetchFriends() {
            const data = await api.getFriends();
            setFriendsList(data);
        }
        fetchFriends();
    }, []);

    async function handleChallenge(friendId: string) {
        try {
            let res = await createGame(friendId)
            setGameId(res.gameId)
            let game = await getGame(res.gameId)
            setGameState(game)
        }
        catch (err) {
            console.log(err); // TO DO: affichage d'erreur
        }
    }
    async function handleJoin() {
        try {
            let res = await joinGame(joinInput.trim())
            setGameState(res)
        }
        catch (err) {
            console.log(err); // TO DO: affichage d'erreur
        }
    }
    if (gameState)
        return <TicTacToeArena initialState={gameState} />;
    return (
        <div>
            {friendsList.map((friend) => (
                <Button key={friend.id} onClick={() => handleChallenge('friend.id')}>Défier {friend.username}</Button>
            ))}
            {gameId && <p>ID à partager : {gameId}</p>}
            {error && <p>{error}</p>}
            <Input
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
            />
            <Button onClick={() => handleJoin()}>Rejoindre</Button>
        </div>
    );
}