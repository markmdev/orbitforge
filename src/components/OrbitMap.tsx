import type { GroundStation, OrbitalNode } from '../domain/types';

type OrbitMapProps = {
  nodes: OrbitalNode[];
  stations: GroundStation[];
  blockedStationIds: string[];
};

const nodePoints = [
  { x: 160, y: 74 },
  { x: 355, y: 42 },
  { x: 545, y: 88 },
];

const stationPoints = [
  { x: 150, y: 205 },
  { x: 360, y: 222 },
  { x: 570, y: 198 },
];

export function OrbitMap({ nodes, stations, blockedStationIds }: OrbitMapProps) {
  return (
    <figure className="orbit-map" aria-label="Seeded orbital contact map">
      <svg role="img" viewBox="0 0 720 270">
        <title>Seeded orbital compute contact map</title>
        <defs>
          <linearGradient id="earth-band" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#27433c" />
            <stop offset="100%" stopColor="#17201d" />
          </linearGradient>
        </defs>
        <ellipse className="orbit-ring outer" cx="360" cy="138" rx="286" ry="94" />
        <ellipse className="orbit-ring inner" cx="360" cy="138" rx="220" ry="66" />
        <circle className="earth-core" cx="360" cy="158" fill="url(#earth-band)" r="48" />
        <path className="earth-band" d="M318 150c28-24 62-26 92-8 0 28-18 52-48 61-28-5-43-24-44-53Z" />

        {nodes.map((node, index) => {
          const point = nodePoints[index] ?? nodePoints[0];
          const stationPoint = stationPoints[index] ?? stationPoints[0];
          const station = stations[index];
          const blocked = station ? blockedStationIds.includes(station.id) : false;

          return (
            <g key={node.id}>
              <line
                className={blocked ? 'contact-link blocked' : 'contact-link'}
                x1={point.x}
                x2={stationPoint.x}
                y1={point.y}
                y2={stationPoint.y}
              />
              <circle className={`node-dot ${node.status}`} cx={point.x} cy={point.y} r="9" />
              <text className="map-label node-label" x={point.x + 14} y={point.y - 8}>
                {node.name}
              </text>
              <text className="map-subtle" x={point.x + 14} y={point.y + 12}>
                {node.thermalMargin}% thermal
              </text>
            </g>
          );
        })}

        {stations.map((station, index) => {
          const point = stationPoints[index] ?? stationPoints[0];
          const blocked = blockedStationIds.includes(station.id);

          return (
            <g key={station.id}>
              <rect
                className={blocked ? 'station-node blocked' : `station-node ${station.status}`}
                height="30"
                rx="3"
                width="118"
                x={point.x - 59}
                y={point.y - 15}
              />
              <text className="map-label station-label" textAnchor="middle" x={point.x} y={point.y + 5}>
                {station.linkType.toUpperCase()} {blocked ? 'BLOCKED' : `${station.nextContactMinutes}m`}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        Seeded contact map: Gemini must route around degraded links while protecting thermal margin.
      </figcaption>
    </figure>
  );
}
