
import { Table, Text } from '@radix-ui/themes';
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from 'react';
import useGameSet, { type ScoreRecord } from '../store/GameSetStore';
import MemoizedScoreRow from './ScoreRow';

// ─── Constants ────────────────────────────────────────────────────────────────
/** Activate virtual list only when history exceeds this count. */
const VIRTUAL_THRESHOLD = 30;
/** Height of a single table row in pixels (must match CSS). */
const ROW_HEIGHT_PX = 36;
/** Max height of the scrollable list container. */
const CONTAINER_HEIGHT_PX = 300;
/** Extra rows rendered above and below the visible window. */
const OVERSCAN = 2;

// ─── VirtualTableBody ─────────────────────────────────────────────────────────
/**
 * Renders only the visible subset of `records` inside a fixed-height container.
 * All invisible rows are replaced by a spacer <div> — their DOM nodes don't
 * exist, saving layout and paint work.
 */
const VirtualTableBody = memo(function VirtualTableBody({
  records,
  editingIdx,
  onEdit,
  onCancel,
  onSave,
}: {
  records: ScoreRecord[];
  editingIdx: number | null;
  onEdit: (idx: number) => void;
  onCancel: () => void;
  onSave: (idx: number, name: string) => void;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = records.length * ROW_HEIGHT_PX;

  // Compute the visible slice
  const { startIdx, endIdx } = useMemo(() => {
    const visibleCount   = Math.ceil(CONTAINER_HEIGHT_PX / ROW_HEIGHT_PX);
    const rawStart       = Math.floor(scrollTop / ROW_HEIGHT_PX);
    const startIdx       = Math.max(0, rawStart - OVERSCAN);
    const endIdx         = Math.min(records.length - 1, rawStart + visibleCount + OVERSCAN);
    return { startIdx, endIdx };
  }, [scrollTop, records.length]);

  const visibleRecords = useMemo(
    () => records.slice(startIdx, endIdx + 1),
    [records, startIdx, endIdx],
  );

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: CONTAINER_HEIGHT_PX, overflowY: 'auto', position: 'relative' }}
      onScroll={handleScroll}
    >
      {/* Total height spacer — makes the scrollbar correct */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible rows, translated to their absolute position */}
        <div style={{ transform: `translateY(${startIdx * ROW_HEIGHT_PX}px)` }}>
          <Table.Root size="1">
            <Table.Body>
              {visibleRecords.map((record, i) => {
                const absoluteIdx = startIdx + i;
                return (
                  <MemoizedScoreRow
                    key={record.id}
                    record={record}
                    idx={absoluteIdx}
                    isEditing={editingIdx === absoluteIdx}
                    onEdit={() => onEdit(absoluteIdx)}
                    onCancel={onCancel}
                    onSave={(name) => onSave(absoluteIdx, name)}
                  />
                );
              })}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </div>
  );
});

// ─── ScoreHistory ─────────────────────────────────────────────────────────────
export default function ScoreHistory() {
  const { scoreHistory, setScoreRecords } = useGameSet();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleUpdateName = useCallback(
    (idx: number, newName: string): void => {
      const updated = scoreHistory.map((r, i) => (i === idx ? { ...r, name: newName } : r));
      setScoreRecords(updated);
      setEditingIdx(null);
    },
    [scoreHistory, setScoreRecords],
  );

  const handleEdit   = useCallback((idx: number) => setEditingIdx(idx), []);
  const handleCancel = useCallback(() => setEditingIdx(null), []);

  if (!scoreHistory.length) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--gray-3)' }}>
        <Text size="2" style={{ color: 'var(--gray-10)' }} className="italic">
          No games played yet.
        </Text>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--gray-5)' }}>
      {scoreHistory.length > VIRTUAL_THRESHOLD ? (
        /**
         * Virtual list path — only ~8 rows in the DOM at any time.
         * The scrollbar reflects the full list height via the spacer div.
         */
        <>
          {/* Sticky header outside the scrollable virtual body */}
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Result</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Level</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
          </Table.Root>
          <VirtualTableBody
            records={scoreHistory}
            editingIdx={editingIdx}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleUpdateName}
          />
        </>
      ) : (
        /**
         * Standard path — full Radix Table for small lists.
         * No virtualisation overhead when it isn't needed.
         */
        <div className="max-h-75 overflow-y-auto">
          <div className="overflow-x-auto">
            <Table.Root size="1" className="min-w-[460px]">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Result</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Level</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {scoreHistory.map((record, idx) => (
                  <MemoizedScoreRow
                    key={record.id}
                    record={record}
                    idx={idx}
                    isEditing={editingIdx === idx}
                    onEdit={() => handleEdit(idx)}
                    onCancel={handleCancel}
                    onSave={(name) => handleUpdateName(idx, name)}
                  />
                ))}
              </Table.Body>
            </Table.Root>
          </div>
        </div>
      )}
    </div>
  );
}