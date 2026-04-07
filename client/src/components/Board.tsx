import type { Tile as TileModel } from '../types';
import { Tile } from './Tile';

interface BoardProps {
  tiles: TileModel[];
  currentPlayerId: string | null;
  selectTile: (tileId: string) => void;
}

export function Board({ tiles, currentPlayerId, selectTile }: BoardProps): JSX.Element {
  return (
    <section>
      <h2>Tablero</h2>
      <div className="board-grid">
        {tiles.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            currentPlayerId={currentPlayerId}
            onSelect={selectTile}
          />
        ))}
      </div>
    </section>
  );
}
