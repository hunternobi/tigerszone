interface PlayerSeries {
  name: string;
  points: number[];
}

interface PunkteverlaufChartProps {
  spieltage: string[];
  players: PlayerSeries[];
}

const LINE_COLORS = ["#5b7fc7", "#f2b84b", "#4ade80", "#f87171", "#c084fc"];

const WIDTH = 640;
const HEIGHT = 260;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;

export default function PunkteverlaufChart({ spieltage, players }: PunkteverlaufChartProps) {
  const maxPoints = Math.max(1, ...players.flatMap((p) => p.points));
  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  function x(index: number): number {
    if (spieltage.length <= 1) return PADDING_LEFT;
    return PADDING_LEFT + (index / (spieltage.length - 1)) * plotWidth;
  }

  function y(value: number): number {
    return PADDING_TOP + plotHeight - (value / maxPoints) * plotHeight;
  }

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxPoints / yTicks) * i));

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Punkteverlauf">
        {yTickValues.map((value) => (
          <g key={value}>
            <line
              x1={PADDING_LEFT}
              x2={WIDTH - PADDING_RIGHT}
              y1={y(value)}
              y2={y(value)}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text x={PADDING_LEFT - 8} y={y(value) + 4} textAnchor="end" fontSize={10} fill="rgba(255,255,255,0.5)">
              {value}
            </text>
          </g>
        ))}

        {spieltage.map((label, index) => (
          <text
            key={label}
            x={x(index)}
            y={HEIGHT - 10}
            textAnchor="middle"
            fontSize={10}
            fill="rgba(255,255,255,0.5)"
          >
            {label}
          </text>
        ))}

        {players.map((player, playerIndex) => {
          const color = LINE_COLORS[playerIndex % LINE_COLORS.length];
          const pathD = player.points
            .map((value, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(value)}`)
            .join(" ");
          return (
            <g key={player.name}>
              <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
              {player.points.map((value, i) => (
                <circle key={i} cx={x(i)} cy={y(value)} r={3} fill={color} />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {players.map((player, index) => (
          <span key={player.name} className="flex items-center gap-1.5 text-xs text-white">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: LINE_COLORS[index % LINE_COLORS.length] }}
            />
            {player.name}
          </span>
        ))}
      </div>
    </div>
  );
}
