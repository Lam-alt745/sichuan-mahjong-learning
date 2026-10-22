import { parseTileCode, SUIT_NAMES, type TileCode, type TileRank, type TileSuit } from "../engine/tiles";

type TileSize = "sm" | "md" | "lg";

export interface TileProps {
  readonly code?: TileCode | string;
  readonly suit?: TileSuit;
  readonly rank?: TileRank;
  readonly size?: TileSize;
  readonly back?: boolean;
  readonly className?: string;
}

const chineseNumbers: Record<TileRank, string> = {
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "六",
  7: "七",
  8: "八",
  9: "九"
};

const dotLayouts: Record<TileRank, Array<[number, number]>> = {
  1: [[12, 16]],
  2: [
    [12, 8],
    [12, 24]
  ],
  3: [
    [7, 8],
    [12, 16],
    [17, 24]
  ],
  4: [
    [7, 8],
    [17, 8],
    [7, 24],
    [17, 24]
  ],
  5: [
    [7, 8],
    [17, 8],
    [12, 16],
    [7, 24],
    [17, 24]
  ],
  6: [
    [7, 6],
    [17, 6],
    [7, 16],
    [17, 16],
    [7, 26],
    [17, 26]
  ],
  7: [
    [12, 4],
    [7, 11],
    [17, 11],
    [7, 19],
    [17, 19],
    [7, 27],
    [17, 27]
  ],
  8: [
    [7, 4],
    [17, 4],
    [7, 12],
    [17, 12],
    [7, 20],
    [17, 20],
    [7, 28],
    [17, 28]
  ],
  9: [
    [5.5, 7],
    [12, 7],
    [18.5, 7],
    [5.5, 16],
    [12, 16],
    [18.5, 16],
    [5.5, 25],
    [12, 25],
    [18.5, 25]
  ]
};

const bambooLayouts: Record<TileRank, Array<[number, number, number, number]>> = {
  1: [[7.5, 8, 9, 14]],
  2: [
    [9.5, 4, 5, 11],
    [9.5, 17, 5, 11]
  ],
  3: [
    [9.5, 1, 5, 10],
    [4.5, 18, 5, 10],
    [14.5, 18, 5, 10]
  ],
  4: [
    [4.5, 4, 5, 11],
    [14.5, 4, 5, 11],
    [4.5, 18, 5, 11],
    [14.5, 18, 5, 11]
  ],
  5: [
    [4.5, 3, 5, 10],
    [14.5, 3, 5, 10],
    [9.5, 11, 5, 10],
    [4.5, 21, 5, 10],
    [14.5, 21, 5, 10]
  ],
  6: [
    [4.5, 2, 5, 8],
    [14.5, 2, 5, 8],
    [4.5, 12, 5, 8],
    [14.5, 12, 5, 8],
    [4.5, 22, 5, 8],
    [14.5, 22, 5, 8]
  ],
  7: [
    [9.75, 1, 4.5, 7],
    [5, 10, 4.5, 7],
    [14.5, 10, 4.5, 7],
    [5, 18, 4.5, 7],
    [14.5, 18, 4.5, 7],
    [5, 26, 4.5, 7],
    [14.5, 26, 4.5, 7]
  ],
  8: [
    [4.5, 1, 5, 6.5],
    [14.5, 1, 5, 6.5],
    [4.5, 9, 5, 6.5],
    [14.5, 9, 5, 6.5],
    [4.5, 17, 5, 6.5],
    [14.5, 17, 5, 6.5],
    [4.5, 25, 5, 6.5],
    [14.5, 25, 5, 6.5]
  ],
  9: [
    [2.5, 2, 4.2, 8],
    [9.9, 2, 4.2, 8],
    [17.3, 2, 4.2, 8],
    [2.5, 12, 4.2, 8],
    [9.9, 12, 4.2, 8],
    [17.3, 12, 4.2, 8],
    [2.5, 22, 4.2, 8],
    [9.9, 22, 4.2, 8],
    [17.3, 22, 4.2, 8]
  ]
};

export function Tile({ code, suit, rank, size = "md", back = false, className = "" }: TileProps) {
  const parsedCode = code ? parseTileCode(code) : undefined;
  const tileRank = rank ?? (parsedCode ? (Number(parsedCode[0]) as TileRank) : undefined);
  const tileSuit = suit ?? (parsedCode ? (parsedCode[1] as TileSuit) : undefined);
  const sizeClass = size === "md" ? "" : size;

  if (back) {
    return <span className={["tile back", sizeClass, className].filter(Boolean).join(" ")} aria-label="牌背" />;
  }

  if (!tileRank || !tileSuit) {
    throw new Error("Tile requires either code or suit + rank");
  }

  const name = SUIT_NAMES[tileSuit];
  const ariaLabel = `${tileRank}${name.zh} ${tileRank} ${name.en}`;

  return (
    <span className={["tile", sizeClass, className].filter(Boolean).join(" ")} title={ariaLabel} aria-label={ariaLabel}>
      <svg viewBox="0 0 24 32" role="img" aria-hidden="true">
        {tileSuit === "p" ? <Dots rank={tileRank} /> : null}
        {tileSuit === "t" ? <Bamboo rank={tileRank} /> : null}
        {tileSuit === "w" ? <Characters rank={tileRank} /> : null}
      </svg>
    </span>
  );
}

export function TileRow({ codes, size = "sm" }: { readonly codes: readonly string[]; readonly size?: TileSize }) {
  return (
    <div className="tile-row" aria-label="mahjong tiles">
      {codes.map((tileCode, index) => (
        <Tile key={`${tileCode}-${index}`} code={tileCode} size={size} />
      ))}
    </div>
  );
}

function Dots({ rank }: { readonly rank: TileRank }) {
  return (
    <>
      {dotLayouts[rank].map(([cx, cy], index) => (
        <g key={index}>
          <circle cx={cx} cy={cy} r="2.9" fill="none" stroke="var(--suit-tong)" strokeWidth="1.1" />
          <circle cx={cx} cy={cy} r="1.05" fill="var(--suit-tong)" />
        </g>
      ))}
    </>
  );
}

function Bamboo({ rank }: { readonly rank: TileRank }) {
  if (rank === 1) {
    return (
      <g>
        <circle cx="12" cy="14" r="5.4" fill="none" stroke="var(--suit-tiao)" strokeWidth="1.6" />
        <circle cx="12" cy="14" r="2.1" fill="var(--suit-tiao-node)" />
        <rect x="10.9" y="18" width="2.2" height="8" rx="1.1" fill="var(--suit-tiao)" />
        <rect x="9.4" y="22" width="5.2" height="1.1" rx="0.5" fill="var(--suit-tiao-node)" />
      </g>
    );
  }

  return (
    <>
      {bambooLayouts[rank].map(([x, y, width, height], index) => (
        <g key={index} transform={`translate(${x} ${y}) scale(${width / 6} ${height / 12})`}>
          <rect x="2.2" y="0.8" width="1.6" height="10.4" rx="0.8" fill="var(--suit-tiao)" />
          <circle cx="3" cy="1.3" r="1.15" fill="var(--suit-tiao-node)" />
          <rect x="1.5" y="5.4" width="3" height="1.1" rx="0.4" fill="var(--suit-tiao-node)" />
        </g>
      ))}
    </>
  );
}

function Characters({ rank }: { readonly rank: TileRank }) {
  return (
    <>
      <text
        x="12"
        y="14"
        fontSize="13"
        fill="var(--suit-wan)"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="600"
      >
        {chineseNumbers[rank]}
      </text>
      <text
        x="12"
        y="29"
        fontSize="13"
        fill="var(--text-hi)"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="600"
      >
        萬
      </text>
    </>
  );
}
