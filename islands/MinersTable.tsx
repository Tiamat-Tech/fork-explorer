import { useState, useEffect, useMemo } from "preact/hooks";
import type { IBlock, IMinerData } from "../shared/interfaces.ts";
import { computeStats, computeMiners } from "../shared/data.ts";
import { blocks, initializeStore, fetchBlocks } from "../lib/store.ts";

type SortKey = "name" | "share" | "blocks" | "signallingStatus";

interface TableRow {
  name: string;
  share: string;
  blocks: string;
  signallingStatus: boolean;
  website: string | undefined;
}

interface MinersTableProps {
  initialBlocks: IBlock[];
}

export default function MinersTable({ initialBlocks }: MinersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("share");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  useEffect(() => {
    if (initialBlocks.length > 0 && blocks.value.length === 0) {
      blocks.value = initialBlocks;
    }

    (async () => {
      await initializeStore();
      if (initialBlocks.length === 0) {
        await fetchBlocks();
      }
    })();
  }, []);

  const currentBlocks = blocks.value.length > 0 ? blocks.value : initialBlocks;
  const { currentNumberOfBlocks } = computeStats(currentBlocks);
  const miners = useMemo(() => computeMiners(currentBlocks), [currentBlocks]);

  const totalSignallingRatio = miners
    .filter(([_, m]) => m.signals)
    .reduce((sum, [_, m]) => sum + m.numBlocks / currentNumberOfBlocks, 0);

  const totalSignallingPotentialRatio = miners
    .filter(([_, m]) => m.numSignallingBlocks > 0)
    .reduce((sum, [_, m]) => sum + m.numBlocks / currentNumberOfBlocks, 0);

  const fixTable = (miners: [string, IMinerData][], key: SortKey): TableRow[] => {
    const data = miners
      .map(([_, miner]) => {
        const r: TableRow = {
          name: miner.name,
          share: `${((miner.numBlocks / currentNumberOfBlocks) * 100).toFixed(2)}%`,
          blocks: `${miner.numSignallingBlocks}/${miner.numBlocks + " "}`,
          signallingStatus: miner.signals,
          website: miner.website,
        };
        return r;
      })
      .sort((a, b) => {
        if (key === "blocks") {
          return Number.parseInt(b["blocks"].split("/")[0]) - Number.parseInt(a["blocks"].split("/")[0]);
        } else if (key === "share") {
          return Number.parseFloat(b["share"].split("%")[0]) - Number.parseFloat(a["share"].split("%")[0]);
        }
        return `${b[key]}`.localeCompare(`${a[key]}`);
      });

    if (sortDirection === "ASC") {
      data.reverse();
    }
    return data;
  };

  const onClickSort = (e: MouseEvent, key: SortKey) => {
    e.preventDefault();
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("DESC");
    } else {
      setSortDirection(sortDirection === "DESC" ? "ASC" : "DESC");
    }
  };

  const tableData = fixTable(miners, sortKey);

  return (
    <>
      <h2 class="totals">
        Current total: {(totalSignallingRatio * 100).toFixed(2)}% ✅
      </h2>
      {totalSignallingPotentialRatio > totalSignallingRatio && (
        <h3 class="totals-potential" title="Share if miners would consistently signal for readiness">
          {`Potential: ${(totalSignallingPotentialRatio * 100).toFixed(2)}%`}
        </h3>
      )}
      <div class="body">
        <table class="miners-table">
          <thead class="table-head">
            <tr class="table-row">
              <th class="table-header">
                <a class="table-header-link" href="#" onClick={(e) => onClickSort(e, "name")}>
                  Mining pool{" "}
                  <span class="table-header-sort">
                    {sortKey === "name" && (sortDirection === "ASC" ? "▴" : "▾")}
                  </span>
                </a>
              </th>
              <th class="table-header">
                <a class="table-header-link" href="#" onClick={(e) => onClickSort(e, "share")}>
                  Share{" "}
                  <span class="table-header-sort">
                    {sortKey === "share" && (sortDirection === "ASC" ? "▴" : "▾")}
                  </span>
                </a>
              </th>
              <th class="table-header">
                <a class="table-header-link" href="#" onClick={(e) => onClickSort(e, "blocks")}>
                  Blocks{" "}
                  <span class="table-header-sort">
                    {sortKey === "blocks" && (sortDirection === "ASC" ? "▴" : "▾")}
                  </span>
                </a>
              </th>
              <th class="table-header">
                <a class="table-header-link" href="#" onClick={(e) => onClickSort(e, "signallingStatus")}>
                  Signals{" "}
                  <span class="table-header-sort">
                    {sortKey === "signallingStatus" && (sortDirection === "ASC" ? "▴" : "▾")}
                  </span>
                </a>
              </th>
            </tr>
          </thead>
          <tbody class="table-body">
            {tableData.map((row) => (
              <tr class="table-row" key={row.name + row.signallingStatus}>
                <td class="table-cell">
                  {row.website ? (
                    <a href={row.website} target="_blank">
                      {row.name}
                    </a>
                  ) : (
                    row.name
                  )}
                </td>
                <td class="table-cell">{row.share}</td>
                <td class="signalling-cell">
                  <a href={`/miner/${row.name}`}>{row.blocks}</a>
                </td>
                <td class="signalling-cell">
                  {row.signallingStatus ? "✅" : "🚫"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
