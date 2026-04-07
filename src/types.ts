export interface Tile {
  id: string;  
  symbol: string;  
  isFlipped: boolean;
  isMatched: boolean;  
  lockedBy: string | null; //es el socket.id del jugador que tiene el tile bloqueado, o null si no está bloqueado
}
export interface Player {
  id: string;
  name: string; 
  score: number;
  isConnected: boolean;
}
export interface ScoreSnapshot {//es el puntaje de todos en un instante dado
  timestamp: number;  
  scores: Record<string, number>;
}
export interface GameState {
  tiles: Tile[];  
  players: Player[];
  scoreHistory: ScoreSnapshot[];  
  isGameOver: boolean;
  startTime: number | null;
}