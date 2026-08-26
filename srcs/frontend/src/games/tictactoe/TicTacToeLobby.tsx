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
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">⚔️ Défier un ami</h3>
            {friendsList.length === 0 ? (
                <p className="text-xs text-slate-500">Vous n'avez pas encore d'amis à défier.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                {friendsList.map((friend) => (
                    <Button key={friend.id} variant="neon" onClick={() => handleChallenge(friend.id)}>
                    {friend.username}
                    </Button>
                ))}
                </div>
            )}
            {gameId && (
                <p className="text-xs font-mono text-emerald-400 bg-slate-950 border border-emerald-500/30 rounded-lg p-2">
                ID à partager : {gameId}
                </p>
            )}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">🔗 Rejoindre une partie</h3>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="flex gap-2">
                <Input
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                placeholder="Collez l'ID de la partie"
                />
                <Button variant="neon" onClick={() => handleJoin()}>Rejoindre</Button>
            </div>
            </div>
        </div>
        );
}