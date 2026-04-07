import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '../types';

export interface UseSocketReturn {
  socket: Socket | null;
  gameState: GameState | null;
  isConnected: boolean;
  joinGame: (name: string) => void;
  selectTile: (tileId: string) => void;
}

const SERVER_URL = 'http://localhost:3000';

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    const onConnect = (): void => {
      setIsConnected(true);
    };

    const onDisconnect = (): void => {
      setIsConnected(false);
    };

    const onGameState = (state: GameState): void => {
      setGameState(state);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('game:state', onGameState);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('game:state', onGameState);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinGame = (name: string): void => {
    const trimmed = name.trim();
    if (!trimmed) return;
    socketRef.current?.emit('player:join', trimmed);
  };

  const selectTile = (tileId: string): void => {
    if (!tileId) return;
    socketRef.current?.emit('tile:select', tileId);
  };

  return {
    socket: socketRef.current,
    gameState,
    isConnected,
    joinGame,
    selectTile,
  };
}
