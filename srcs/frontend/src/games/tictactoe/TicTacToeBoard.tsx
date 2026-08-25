import Button from '../../components/common/Button';
import type { Cell } from './types'

interface TicTacToeBoardProps {
    board: Cell[];
    onCellClick: (position: number) => void;
    disabled?: boolean;
}

export function TicTacToeBoard({ board, onCellClick, disabled }: TicTacToeBoardProps) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: '4px' }}>
            {board.map((cell, index) => (
                <Button
                    key={index}
                    onClick={() => onCellClick(index)}
                    disabled={disabled || cell !== null}
                    style={{ height: '80px', fontSize: '2rem' }}
                >
                    {cell}
                </Button>
            ))}
        </div>
    );
}
