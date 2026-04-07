import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Player, ScoreSnapshot } from '../types';

interface LiveChartProps {
  scoreHistory: ScoreSnapshot[];
  players: Player[];
}

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export function LiveChart({ scoreHistory, players }: LiveChartProps): JSX.Element {
  const chartData = useMemo(() => {
    return scoreHistory.map((snapshot) => {
      const row: Record<string, string | number> = {
        timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
      };

      players.forEach((player) => {
        row[player.name] = snapshot.scores[player.name] ?? 0;
      });

      return row;
    });
  }, [scoreHistory, players]);

  return (
    <section>
      <h2>Evolución de Puntajes</h2>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {players.map((player, index) => (
              <Line
                key={player.id}
                type="monotone"
                dataKey={player.name}
                stroke={COLORS[index % COLORS.length] ?? '#0ea5e9'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
