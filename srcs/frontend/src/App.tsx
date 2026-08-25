import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { io, type Socket } from 'socket.io-client'
import './App.css'

type Cell = 'X' | 'O' | null
type GameStatus = 'waiting' | 'playing' | 'finished' | 'draw'
type GameState = { gameId: string; board: Cell[]; currentPlayer: 'X' | 'O'; status: GameStatus; winner: 'X' | 'O' | null; playerXId: string; playerOId: string }
type CreateGameResponse = { gameId: string }
type MoveResult = GameState | { error: string }

const API_URL = import.meta.env.VITE_API_URL ?? ''

function getUserIdFromToken(token: string): string {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).sub ?? ''
  } catch {
    return ''
  }
}

async function api<T>(path: string, options: RequestInit = {}, token = ''): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new Error(message ?? `Erreur ${response.status}`)
  }
  return body as T
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('ttt-token') ?? '')
  const [userId, setUserId] = useState(() => getUserIdFromToken(token))
  const [socket, setSocket] = useState<Socket | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [opponentId, setOpponentId] = useState('')
  const [gameIdInput, setGameIdInput] = useState('')
  const [game, setGame] = useState<GameState | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const gameIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    setUserId(getUserIdFromToken(token))
  }, [token])

  useEffect(() => {
    gameIdRef.current = game?.gameId
  }, [game?.gameId])

  useEffect(() => {
    if (!token) return
    const gameSocket = io(`${API_URL}/games`, { auth: { token } })
    gameSocket.on('game:state', (state: GameState) => setGame(state))
    gameSocket.on('connect_error', (connectionError: Error) => setError(connectionError.message))
    gameSocket.on('connect', () => {
      if (gameIdRef.current) gameSocket.emit('game:join', { gameId: gameIdRef.current })
    })
    setSocket(gameSocket)
    return () => {
      gameSocket.disconnect()
      setSocket(null)
    }
  }, [token])

  useEffect(() => {
    if (socket && game?.gameId) socket.emit('game:join', { gameId: game.gameId })
  }, [socket, game?.gameId])

  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError(''); setMessage('')
    try { await action() } catch (caught) { setError(caught instanceof Error ? caught.message : 'Une erreur est survenue.') } finally { setBusy(false) }
  }

  const authenticate = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => {
      if (mode === 'register') await api('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) })
      const result = await api<{ accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      sessionStorage.setItem('ttt-token', result.accessToken); setToken(result.accessToken); setMessage('Connexion réussie.')
    })
  }

  const createGame = () => void run(async () => {
    const response = await api<CreateGameResponse>('/games', { method: 'POST', body: JSON.stringify({ opponentId }) }, token)
    const id = response?.gameId
    if (!id) throw new Error('Le backend n’a pas retourné l’identifiant de la partie.')
    setGameIdInput(id); setGame(await api<GameState>(`/games/${id}`, {}, token)); setMessage('Partie créée. Partagez cet identifiant avec le joueur O.')
  })
  const joinGame = () => void run(async () => { setGame(await api<GameState>(`/games/${gameIdInput}/join`, { method: 'POST' }, token)); setMessage('Partie rejointe.') })
  const loadGame = () => void run(async () => { setGame(await api<GameState>(`/games/${gameIdInput}`, {}, token)) })
  const play = (position: number) => {
    if (!game?.gameId) { setError('Aucune partie valide n’est chargée.'); return }
    if (game.board[position]) { setError('Cette case est déjà occupée.'); return }
    setBusy(true); setError(''); setMessage('')
    if (socket?.connected) {
      socket.emit('game:move', { gameId: game.gameId, position }, (result: MoveResult) => {
        if ('error' in result) setError(result.error)
        setBusy(false)
      })
      return
    }
    void api<GameState>(`/games/${game.gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ position }),
    }, token).then(setGame).catch((caught) => {
      setError(caught instanceof Error ? caught.message : 'Le coup a échoué.')
    }).finally(() => setBusy(false))
  }
  const isMyTurn = game ? (game.currentPlayer === 'X' ? game.playerXId === userId : game.playerOId === userId) : false
  const canPlay = Boolean(game) && game?.status === 'playing' && isMyTurn && !busy

  if (!token) {
    return <main className="shell auth-shell"><div className="brand-mark">TTT</div><p className="eyebrow">API playground</p><h1>Un coup à la fois.</h1><p className="intro">Connectez deux comptes pour tester une partie en conditions réelles.</p><form className="auth-form" onSubmit={authenticate}>{mode === 'register' && <label>Nom d'utilisateur<input value={username} onChange={(event) => setUsername(event.target.value)} required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="primary-button" disabled={busy}>{busy ? 'Patientez...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}</button></form><button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Créer un compte de test' : 'J’ai déjà un compte'}</button>{error && <p className="feedback error">{error}</p>}{message && <p className="feedback">{message}</p>}</main>
  }

  return (
    <main className="shell game-shell"><header className="topbar"><div><p className="eyebrow">API playground</p><h1>Tic-Tac-Toe</h1></div><button className="text-button" onClick={() => { sessionStorage.removeItem('ttt-token'); setToken('') }}>Se déconnecter</button></header><section className="setup-grid"><div className="panel"><span className="step">01</span><h2>Créer une partie</h2><p>Vous serez le joueur X.</p><input placeholder="UUID du joueur O" value={opponentId} onChange={(event) => setOpponentId(event.target.value)} /><button className="primary-button" onClick={createGame} disabled={busy || !opponentId}>Nouvelle partie</button></div><div className="panel"><span className="step">02</span><h2>Rejoindre ou charger</h2><p>Utilisez l'UUID reçu de l'autre joueur.</p><input placeholder="UUID de la partie" value={gameIdInput} onChange={(event) => setGameIdInput(event.target.value)} /><div className="button-row"><button className="secondary-button" onClick={joinGame} disabled={busy || !gameIdInput}>Rejoindre</button><button className="icon-button" onClick={loadGame} disabled={busy || !gameIdInput} aria-label="Rafraîchir l'état">↻</button></div></div></section><section className="board-section"><div className="game-meta"><div><p className="eyebrow">Partie</p><strong>{game?.gameId ?? 'Aucune partie sélectionnée'}</strong></div><span className={`status status-${game?.status ?? 'waiting'}`}>{game?.status ?? 'idle'}</span></div><div className="board">{(game?.board ?? Array(9).fill(null)).map((cell, position) => <button key={position} className={`cell ${cell ? `cell-${cell.toLowerCase()}` : ''}`} onClick={() => play(position)} disabled={!canPlay || Boolean(cell)} aria-label={`Case ${position + 1}`}>{cell}</button>)}</div><p className="turn">{game?.status === 'finished' ? `Victoire de ${game.winner}` : game?.status === 'draw' ? 'Match nul' : game?.status === 'waiting' ? 'En attente du joueur O' : game && !isMyTurn ? `En attente du joueur ${game.currentPlayer}` : game ? `Votre tour : ${game.currentPlayer}` : 'Créez ou rejoignez une partie'}</p></section>{error && <p className="feedback error">{error}</p>}{message && <p className="feedback">{message}</p>}</main>
  )
}

export default App
