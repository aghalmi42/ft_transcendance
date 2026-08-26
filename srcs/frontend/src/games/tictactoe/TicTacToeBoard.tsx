import type { Cell } from './types'

interface TicTacToeBoardProps {
    board: Cell[];
    onCellClick: (position: number) => void;
    disabled?: boolean;
}

export function TicTacToeBoard({ board, onCellClick, disabled }: TicTacToeBoardProps) {
    return (
        <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
            {board.map((cell, index) => (
                <button
                    key={index}
                    onClick={() => onCellClick(index)}
                    disabled={disabled || cell !== null}
                    className={`w-20 h-20 rounded-xl border flex items-center justify-center text-4xl font-black transition-all
                    ${cell === null && !disabled ? 'bg-slate-900 border-slate-700 hover:border-violet-500 hover:bg-slate-800 cursor-pointer' : 'bg-slate-900/60 border-slate-800 cursor-default'}
                    ${cell === 'X' ? 'text-cyan-400' : ''}
                    ${cell === 'O' ? 'text-rose-400' : ''}
                    `}
                >
                    {cell}
                </button>
            ))}
        </div>
    );
}
