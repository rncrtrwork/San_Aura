import type { OccupancyPoint } from '@/server/dashboard/getOccupancySeries';

type OccupancyChartProps = {
  data: OccupancyPoint[];
};

type Series = {
  key: 'cabin' | 'rv' | 'tent';
  label: string;
  color: string;
  dashed: boolean;
};

const series: Series[] = [
  { key: 'cabin', label: 'Cabins', color: '#06442D', dashed: false },
  { key: 'rv', label: 'RV Sites', color: '#C87500', dashed: false },
  { key: 'tent', label: 'Tent Sites', color: '#7B9B63', dashed: true },
];

const chart = {
  width: 900,
  height: 290,
  left: 52,
  right: 18,
  top: 20,
  bottom: 48,
};

function xPosition(index: number, pointCount: number): number {
  const plotWidth = chart.width - chart.left - chart.right;
  return pointCount <= 1 ? chart.left : chart.left + (index / (pointCount - 1)) * plotWidth;
}

function yPosition(value: number): number {
  const plotHeight = chart.height - chart.top - chart.bottom;
  return chart.top + plotHeight - (value / 100) * plotHeight;
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  const gridValues = [100, 75, 50, 25, 0];

  return (
    <figure className="admin-card overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <figcaption className="text-base font-bold text-forest-900">14-Day Occupancy</figcaption>
        <div className="flex flex-wrap items-center gap-5 text-xs text-admin-muted">
          {series.map((item) => (
            <span key={item.key} className="flex items-center gap-2">
              <span
                className="block w-7 border-t-2"
                style={{ borderColor: item.color, borderStyle: item.dashed ? 'dashed' : 'solid' }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label="Fourteen-day occupancy percentages for cabins, RV sites, and tent sites"
          className="min-w-[720px]"
        >
          {gridValues.map((value) => {
            const y = yPosition(value);
            return (
              <g key={value}>
                <line
                  x1={chart.left}
                  y1={y}
                  x2={chart.width - chart.right}
                  y2={y}
                  stroke="#DEDBD2"
                  strokeDasharray="3 4"
                />
                <text x={chart.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#687068">
                  {value}%
                </text>
              </g>
            );
          })}
          {series.map((item) => {
            const points = data
              .map(
                (point, index) => `${xPosition(index, data.length)},${yPosition(point[item.key])}`,
              )
              .join(' ');
            return (
              <polyline
                key={item.key}
                points={points}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={item.dashed ? '7 7' : undefined}
              />
            );
          })}
          {data.map((point, index) => (
            <text
              key={point.date}
              x={xPosition(index, data.length)}
              y={chart.height - 18}
              textAnchor="middle"
              fontSize="10"
              fill="#687068"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </figure>
  );
}
