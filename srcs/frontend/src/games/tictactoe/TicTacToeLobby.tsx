import { useState } from "react";
import { useEffect, useRef } from "react";
import type { User, Friendship } from "../../types";
import type { TicTacToeState } from "./types";
import { createGame, getGame, joinGame } from "./api";
import { api } from "../../services/api";
import { socketService } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useNotification } from "../../context/NotificationContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { TicTacToeArena } from "./TicTacToeArena";

interface TicTacToeLobbyProps {
    autoJoinGameId?: string;
    autoResumeGameId?: string;
}

export function TicTacToeLobby({ autoJoinGameId, autoResumeGameId }: TicTacToeLobbyProps) {
    const { user } = useAuth();
    const { sendMessage } = useChat();
    const { addToast } = useNotification();
    const [friendsList, setFriendsList] = useState<User[]>([])
    const [joinInput, setJoinInput] = useState<string>("")
    const [gameState, setGameState] = useState<TicTacToeState | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [gameId, setGameId] = useState<string | null>(null)
    const autoRanRef = useRef(false)

    useEffect(() => {
        if (autoRanRef.current) return;
        autoRanRef.current = true;
        if (autoJoinGameId) {
            handleJoin(autoJoinGameId);
        } else if (autoResumeGameId) {
            handleResume(autoResumeGameId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoJoinGameId, autoResumeGameId]);

    useEffect(() => {
        if (!user) return;
        async function fetchFriends() {
            try {
                const data = await api.getFriends() as unknown as Friendship[];
                const accepted = (Array.isArray(data) ? data : [])
                    .filter((f) => f.status === 'ACCEPTED')
                    .map((f) => (f.sender?.id === user!.id ? f.receiver : f.sender))
                    .filter((u): u is User => !!u);
                setFriendsList(accepted);
            } catch {
                setFriendsList([]);
            }
        }
        fetchFriends();
    }, [user]);

    async function handleChallenge(friendId: string) {
        setError(null)
        try {
            const res = await createGame(friendId)
            setGameId(res.gameId)
            const game = await getGame(res.gameId)
            setGameState(game)

            socketService.sendChat('sendGameChallenge', {
                receiverId: friendId,
                gameType: 'TICTACTOE',
                roomId: res.gameId,
            });
            sendMessage(friendId, '🎯 Défi lancé pour une partie de TICTACTOE !');
            addToast('Défi envoyé en direct à votre ami !', 'success');
        }
        catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
            else
                setError("Une erreur inattendue est survenue")
        }
    }
    async function handleJoin(idOverride?: string) {
        const id = (idOverride ?? joinInput).trim()
        setError(null)
        try {
            const res = await joinGame(id)
            setGameId(id)
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

    async function handleResume(id: string) {
        setError(null)
        try {
            const game = await getGame(id)
            setGameId(id)
            setGameState(game)
        }
        catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            }
            else
                setError("Une erreur inattendue est survenue.")
        }
    }
    if (gameState)
        return <TicTacToeArena initialState={gameState} />;
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            {/* <Button onClick={() => handleChallenge("10239a6f-421e-4522-8cb1-6f1a39151598")}>Défier test</Button> */}
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