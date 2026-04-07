import { Board } from './components/Board';
import { LiveChart } from './components/LiveChart';
import { Lobby } from './components/Lobby';
import { Scoreboard } from './components/Scoreboard';
import { useSocket } from './hooks/useSocket';
import './app.css';

export default function App(): JSX.Element {
  const { socket, gameState, isConnected, joinGame, selectTile } = useSocket();

  const currentPlayerId = socket?.id ?? null;
  const joinedPlayer = gameState?.players.find((player) => player.id === currentPlayerId);

  if (!gameState) {
    return <main className="app-shell">Cargando estado del juego...</main>;
  }

  if (!joinedPlayer) {
    return (
      <main className="app-shell">
        <p className="connection-text">
          Estado de conexión: {isConnected ? 'Conectado' : 'Desconectado'}
        </p>
        <Lobby joinGame={joinGame} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Mahjong Colaborativo</h1>
        <p>
          Jugador: <strong>{joinedPlayer.name}</strong>
        </p>
        <p>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      </header>

      <div className="game-layout">
        <Board
          tiles={gameState.tiles}
          currentPlayerId={currentPlayerId}
          selectTile={selectTile}
        />
        <Scoreboard players={gameState.players} />
      </div>

      <LiveChart scoreHistory={gameState.scoreHistory} players={gameState.players} />
    </main>
  );
}
