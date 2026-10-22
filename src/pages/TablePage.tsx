import { Eye, FastForward, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LangMode } from "../content/types";
import { Tile, TileRow } from "../components/Tile";
import { buildCoachAdvice, type CoachMode } from "../engine/coach";
import {
  autoDeclareVoids,
  autoFinishGame,
  beginPlay,
  claimDiscard,
  claimSelfDrawWin,
  createTableGame,
  declareKongForCurrent,
  declareVoidSuit,
  discardForCurrent,
  getLegalActions,
  passClaim,
  playerWaits,
  runAutoUntilHuman,
  type ClaimKind,
  type PlayerState
} from "../engine/table";
import { sortTileCodes, tileName, type TileCode, type TileSuit } from "../engine/tiles";
import { useProgressStore } from "../state/progress";

export function TablePage({ mode }: { readonly mode: LangMode }) {
  const [gameIndex, setGameIndex] = useState(1);
  const [game, setGame] = useState(() => createTableGame("table-1"));
  const [selectedTile, setSelectedTile] = useState<TileCode | undefined>();
  const coachMode = useProgressStore((state) => state.coachMode);
  const setCoachMode = useProgressStore((state) => state.setCoachMode);
  const recordDrill = useProgressStore((state) => state.recordDrill);
  const tablePoints = useProgressStore((state) => state.tablePoints);
  const recordTablePoints = useProgressStore((state) => state.recordTablePoints);
  const resetTablePoints = useProgressStore((state) => state.resetTablePoints);
  const [recordedSettlementKey, setRecordedSettlementKey] = useState<string | undefined>();
  const player = game.players[0];
  const actions = getLegalActions(game, 0);
  const advice = useMemo(() => buildCoachAdvice(game, 0, coachMode), [coachMode, game]);
  const waits = playerWaits(player);

  useEffect(() => {
    if (!game.settlement) {
      return;
    }
    const key = `${game.seed}-${game.endReason}-${game.turn}-${game.settlement.payments.length}`;
    if (recordedSettlementKey === key) {
      return;
    }
    recordTablePoints(game.settlement.net[0] ?? 0);
    setRecordedSettlementKey(key);
  }, [game.endReason, game.seed, game.settlement, game.turn, recordTablePoints, recordedSettlementKey]);

  const setAndRun = (nextGame: typeof game, clearSelection = true) => {
    setGame(runAutoUntilHuman(nextGame));
    if (clearSelection) {
      setSelectedTile(undefined);
    }
  };

  const newHand = () => {
    const nextIndex = gameIndex + 1;
    setGameIndex(nextIndex);
    setSelectedTile(undefined);
    setRecordedSettlementKey(undefined);
    setGame(createTableGame(`table-${nextIndex}`));
  };

  const chooseVoid = (suit: TileSuit) => {
    const declared = declareVoidSuit(game, 0, suit);
    setAndRun(beginPlay(autoDeclareVoids(declared)));
  };

  const discardSelected = () => {
    if (!selectedTile) {
      return;
    }
    setAndRun(discardForCurrent(game, selectedTile));
  };

  const claim = (kind: ClaimKind) => {
    setAndRun(claimDiscard(game, 0, kind));
  };

  return (
    <main className="container table-page">
      <section className="page-head">
        <h1>血战牌桌 · Fight-to-the-end Table</h1>
        <div className="table-tools">
          <span className="score-chip">教学积分 {tablePoints >= 0 ? `+${tablePoints}` : tablePoints}</span>
          <button className="btn btn-line" type="button" onClick={() => setGame(autoFinishGame(game))}>
            <FastForward size={15} /> 完整演示 · Auto finish
          </button>
          <button className="btn btn-line" type="button" onClick={newHand}>
            <RotateCcw size={15} /> 新一局 · New hand
          </button>
          <button className="btn btn-line" type="button" onClick={resetTablePoints}>
            重置积分 · Reset points
          </button>
        </div>
      </section>

      {game.phase === "void-selection" ? (
        <section className="panel void-select">
          <span className="m1-tag">定缺声明 · DECLARE VOID SUIT</span>
          <h2>选择本局要打缺的一门</h2>
          <div className="void-options">
            {(["p", "t", "w"] as const).map((suit) => (
              <button key={suit} type="button" className="btn btn-line" onClick={() => chooseVoid(suit)}>
                {suitZh(suit)} · {suitEn(suit)}
              </button>
            ))}
          </div>
          <PlayerHand player={player} selectedTile={selectedTile} onSelect={setSelectedTile} />
        </section>
      ) : (
        <section className="table-layout">
          <Seat player={game.players[2]} mode={mode} position="top" />
          <Seat player={game.players[1]} mode={mode} position="left" />
          <TableCenter game={game} mode={mode} />
          <Seat player={game.players[3]} mode={mode} position="right" />
          <section className="player-console panel">
            <div className="player-console-head">
              <PlayerMeta player={player} mode={mode} />
              <div className="player-ready">
                {waits.length > 0 ? (
                  <span>听牌 · Ready: {formatTiles(waits, mode)}</span>
                ) : (
                  <span>未听牌 · Not ready</span>
                )}
              </div>
            </div>

            <PlayerHand player={player} selectedTile={selectedTile} onSelect={setSelectedTile} />

            <div className="action-bar">
              <button className="btn btn-bamboo" type="button" disabled={!actions.includes("discard") || !selectedTile} onClick={discardSelected}>
                打牌 · Discard
              </button>
              <button className="btn btn-line" type="button" disabled={!actions.includes("pung")} onClick={() => claim("pung")}>
                碰 · Pung
              </button>
              <button
                className="btn btn-line"
                type="button"
                disabled={!actions.includes("kong")}
                onClick={() => {
                  if (game.pendingClaim) {
                    claim("kong");
                  } else {
                    setAndRun(declareKongForCurrent(game, selectedTile), false);
                  }
                }}
              >
                杠 · Kong
              </button>
              <button
                className="btn btn-line"
                type="button"
                disabled={!actions.includes("win")}
                onClick={() => {
                  if (game.pendingClaim) {
                    claim("win");
                  } else {
                    setAndRun(claimSelfDrawWin(game, 0));
                  }
                }}
              >
                胡 · Win
              </button>
              {game.pendingClaim ? (
                <button className="btn btn-line" type="button" onClick={() => setAndRun(passClaim(game, 0))}>
                  过 · Pass
                </button>
              ) : null}
              <span className="no-chow">无吃按钮 · No Chow</span>
            </div>
          </section>

          <aside className="coach-panel panel">
            <div className="coach-head">
              <div>
                <span className="m1-tag">教练 · COACH</span>
                <h2>{coachMode === "off" ? "关闭" : coachMode === "direct" ? "直答" : "引导"}</h2>
              </div>
              <div className="segmented small">
                {(["guided", "direct", "off"] as const).map((item) => (
                  <button key={item} type="button" className={coachMode === item ? "on" : ""} onClick={() => setCoachMode(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <p className="coach-conclusion">{mode === "en" ? advice.conclusionEn : advice.conclusionZh}</p>
            {advice.steps.map((step) => (
              <div key={step.id} className="coach-step">
                <h3>{mode === "en" ? step.titleEn : step.titleZh}</h3>
                <p>{mode === "en" ? step.promptEn : step.promptZh}</p>
                <strong>{mode === "en" ? step.conclusionEn : step.conclusionZh}</strong>
                {step.candidates ? (
                  <div className="coach-candidates">
                    {step.candidates.map((candidate) => (
                      <span key={candidate.tile}>{mode === "en" ? candidate.labelEn : candidate.labelZh}</span>
                    ))}
                  </div>
                ) : null}
                <button className="mark-weak" type="button" onClick={() => recordDrill("coach", 1, 0, step.terms)}>
                  标记弱项 · Mark weak
                </button>
              </div>
            ))}
            {coachMode === "guided" ? (
              <button className="btn btn-line" type="button" onClick={() => setCoachMode("direct")}>
                <Eye size={15} /> 跳过引导，直接看结论
              </button>
            ) : null}
          </aside>
        </section>
      )}
    </main>
  );
}

function Seat({ player, mode, position }: { readonly player: PlayerState; readonly mode: LangMode; readonly position: "top" | "left" | "right" }) {
  return (
    <section className={`seat panel ${position}`}>
      <PlayerMeta player={player} mode={mode} />
      {player.won ? (
        <div className="revealed">
          <span className="m1-tag">已胡亮牌 · WON</span>
          <TileRow codes={player.revealed.slice(0, 14)} size="sm" />
        </div>
      ) : (
        <div className="ai-hand">
          {Array.from({ length: Math.min(player.hand.length, 14) }, (_, index) => (
            <Tile key={index} back size="sm" />
          ))}
          <span>{player.hand.length} 张</span>
        </div>
      )}
      <River player={player} />
    </section>
  );
}

function TableCenter({ game, mode }: { readonly game: ReturnType<typeof createTableGame>; readonly mode: LangMode }) {
  const current = game.players[game.currentPlayer];
  return (
    <section className="table-center panel">
      <div className="table-state-line">
        <span className="m1-tag">{game.phase === "finished" ? "本局结束 · FINISHED" : "进行中 · PLAYING"}</span>
        <span>牌墙 {game.wall.length}</span>
        <span>当前：{mode === "en" ? current.nameEn : current.nameZh}</span>
      </div>
      {game.pendingClaim ? (
        <p className="claim-note">
          {mode === "en"
            ? `Discard response: ${tileName(game.pendingClaim.tile).en}`
            : `响应舍牌：${tileName(game.pendingClaim.tile).zh}`}
        </p>
      ) : null}
      {game.phase === "finished" ? (
        <div className="draw-flags">
          {game.players.map((player) => (
            <div key={player.id}>
              <b>{mode === "en" ? player.nameEn : player.nameZh}</b>
              <span>{player.floweryPig ? "花猪" : "非花猪"}</span>
              <span>{player.tenpai ? "听牌" : "未听"}</span>
            </div>
          ))}
        </div>
      ) : null}
      {game.settlement ? <SettlementPanel game={game} mode={mode} /> : null}
      <div className="table-log">
        {game.log.slice(-8).map((entry, index) => (
          <p key={`${entry.id}-${index}`}>{mode === "en" ? entry.en : entry.zh}</p>
        ))}
      </div>
    </section>
  );
}

function SettlementPanel({ game, mode }: { readonly game: ReturnType<typeof createTableGame>; readonly mode: LangMode }) {
  const settlement = game.settlement;
  if (!settlement) {
    return null;
  }

  return (
    <section className="settlement-panel">
      <div className="settlement-head">
        <span className="m1-tag">结算 · SETTLEMENT</span>
        <span>{mode === "en" ? "Teaching points" : "教学积分"}</span>
      </div>
      {game.winEvents.length > 0 ? (
        <div className="score-results">
          {game.winEvents.map((event, index) => (
            <div key={`${event.winner}-${index}`} className="score-result">
              <b>{playerName(game, event.winner, mode)}</b>
              <span>
                {mode === "en"
                  ? `${event.result.pattern.en}: ${event.result.totalFan} fan, ${event.result.paymentPoints} points per payment`
                  : `${event.result.pattern.zh}：${event.result.totalFan} 番，每笔 ${event.result.paymentPoints} 分`}
              </span>
              {event.result.capped ? <em>{mode === "en" ? "8-fan cap" : "8 番封顶"}</em> : null}
            </div>
          ))}
        </div>
      ) : null}
      <div className="payment-list">
        {settlement.payments.length > 0 ? (
          settlement.payments.slice(0, 10).map((payment, index) => (
            <div key={`${payment.from}-${payment.to}-${payment.kind}-${index}`} className="payment-line">
              <span>{mode === "en" ? payment.reasonEn : payment.reasonZh}</span>
              <b>{payment.points} 分</b>
            </div>
          ))
        ) : (
          <p>{mode === "en" ? "No point transfer in this settlement." : "本局没有积分转移。"}</p>
        )}
      </div>
      <div className="net-list">
        {game.players.map((player) => (
          <span key={player.id}>
            {mode === "en" ? player.nameEn : player.nameZh} {formatSigned(settlement.net[player.id] ?? 0)}
          </span>
        ))}
      </div>
    </section>
  );
}

function PlayerMeta({ player, mode }: { readonly player: PlayerState; readonly mode: LangMode }) {
  return (
    <div className="player-meta">
      <div>
        <b>{mode === "en" ? player.nameEn : player.nameZh}</b>
        <span>{profileLabel(player.profile)}</span>
      </div>
      <div className="player-tags">
        <span>定缺 {player.voidSuit ? suitZh(player.voidSuit) : "-"}</span>
        {player.won ? <span className="won-tag">已胡</span> : null}
        {player.melds.length > 0 ? <span>{player.melds.length} 面子</span> : null}
      </div>
    </div>
  );
}

function PlayerHand({
  player,
  selectedTile,
  onSelect
}: {
  readonly player: PlayerState;
  readonly selectedTile?: TileCode;
  readonly onSelect: (tile: TileCode) => void;
}) {
  return (
    <div className="player-hand">
      {sortTileCodes(player.hand).map((tile, index) => (
        <button
          key={`${tile}-${index}`}
          type="button"
          className={selectedTile === tile ? "selected" : ""}
          onClick={() => onSelect(tile)}
          title={tileName(tile).zh}
        >
          <Tile code={tile} size="md" />
        </button>
      ))}
    </div>
  );
}

function River({ player }: { readonly player: PlayerState }) {
  return (
    <div className="river">
      <span className="m1-tag">舍牌河 · River</span>
      <div>{player.discards.slice(-18).map((tile, index) => <Tile key={`${tile}-${index}`} code={tile} size="sm" />)}</div>
    </div>
  );
}

function suitZh(suit: TileSuit): string {
  return suit === "p" ? "筒" : suit === "t" ? "条" : "万";
}

function suitEn(suit: TileSuit): string {
  return suit === "p" ? "Dots" : suit === "t" ? "Bamboo" : "Characters";
}

function profileLabel(profile: PlayerState["profile"]): string {
  return profile === "steady"
    ? "稳健"
    : profile === "aggressive"
      ? "激进"
      : profile === "conservative"
        ? "保守"
        : profile === "efficiency"
          ? "牌效"
          : "均衡";
}

function formatTiles(tiles: readonly TileCode[], mode: LangMode): string {
  return tiles.map((tile) => (mode === "en" ? tileName(tile).en : tileName(tile).zh)).join(mode === "en" ? ", " : "、");
}

function playerName(game: ReturnType<typeof createTableGame>, playerId: number, mode: LangMode): string {
  const player = game.players.find((item) => item.id === playerId);
  if (!player) {
    return mode === "en" ? `Player ${playerId}` : `玩家${playerId}`;
  }
  return mode === "en" ? player.nameEn : player.nameZh;
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
