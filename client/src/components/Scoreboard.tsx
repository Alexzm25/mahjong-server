import type { Player } from '../types';

interface ScoreboardProps {
  players: Player[];
}

export function Scoreboard({ players }: ScoreboardProps): JSX.Element {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <section>
      <h2>Scoreboard</h2>
      <table className="scoreboard-table">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Puntaje</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.score}</td>
              <td>
                <span
                  className={player.isConnected ? 'status-dot online' : 'status-dot offline'}
                  title={player.isConnected ? 'Conectado' : 'Desconectado'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
