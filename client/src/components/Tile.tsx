import { memo } from 'react';
import type { Tile as TileModel } from '../types';

interface TileProps {
  tile: TileModel;
  currentPlayerId: string | null;
  onSelect: (tileId: string) => void;
}

function TileComponent({ tile, currentPlayerId, onSelect }: TileProps): JSX.Element {
  const isBlockedByOther = Boolean(tile.lockedBy && tile.lockedBy !== currentPlayerId);
  const canClick = !tile.isMatched && !tile.isFlipped && !isBlockedByOther;

  const classNames = [
    'tile',
    tile.isMatched ? 'tile-matched' : '',
    tile.isFlipped ? 'tile-flipped' : '',
    isBlockedByOther ? 'tile-blocked' : '',
    canClick ? 'tile-clickable' : 'tile-disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      onClick={() => canClick && onSelect(tile.id)}
      disabled={!canClick}
      aria-label={`ficha-${tile.id}`}
    >
      {tile.isFlipped || tile.isMatched ? tile.symbol : '🀫'}
    </button>
  );
}

export const Tile = memo(TileComponent);
