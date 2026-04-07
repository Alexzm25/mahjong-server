import { FormEvent, useState } from 'react';

interface LobbyProps {
  joinGame: (name: string) => void;
}

export function Lobby({ joinGame }: LobbyProps): JSX.Element {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('El nombre es obligatorio.');
      return;
    }

    setError('');
    joinGame(trimmed);
  };

  return (
    <div className="lobby-card">
      <h1>Mahjong Colaborativo</h1>
      <p>Ingresa tu nombre para unirte a la partida.</p>

      <form onSubmit={onSubmit} className="lobby-form">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tu nombre"
          maxLength={24}
        />
        <button type="submit">Unirse</button>
      </form>

      {error && <small className="error-text">{error}</small>}
    </div>
  );
}
