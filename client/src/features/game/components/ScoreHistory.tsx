import { VirtualList } from '@/shared/components/VirtualList';
import { Badge, Text } from '@radix-ui/themes';
import { memo, useCallback, useState } from 'react';
import useGameSet, { type ScoreRecord } from '../store/GameSetStore';

const ROW_HEIGHT = 52;
const MAX_HEIGHT = 360;

const ScoreHistoryRow = memo(function ScoreHistoryRow({
  record,
  index,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: {
  record: ScoreRecord;
  index: number;
  isEditing: boolean;
  onEdit: (idx: number) => void;
  onCancel: () => void;
  onSave: (idx: number, value: string) => void;
}) {
  return (
    <div className="grid h-[52px] grid-cols-5 items-center border-b border-(--gray-4) px-3 text-xs">
      <span>{index + 1}</span>
      {isEditing ? (
        <input
          autoFocus
          defaultValue={record.name}
          onBlur={(e) => onSave(index, e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(index, e.currentTarget.value.trim());
            if (e.key === 'Escape') onCancel();
          }}
          className="rounded border border-(--blue-7) px-2 py-1"
        />
      ) : (
        <button type="button" className="truncate text-left" onClick={() => onEdit(index)}>
          {record.name || '—'}
        </button>
      )}
      <span className="font-semibold">{Math.round(record.score)}</span>
      <Badge color={record.result === 'win' ? 'green' : 'red'} variant="soft" radius="full" size="1">
        {record.result}
      </Badge>
      <span>{record.difficultLevel}</span>
    </div>
  );
});

export default function ScoreHistory() {
  const scoreHistory = useGameSet((state) => state.scoreHistory);
  const setScoreRecords = useGameSet((state) => state.setScoreRecords);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleSave = useCallback(
    (idx: number, value: string): void => {
      const newName = value || scoreHistory[idx].name;
      const updated = scoreHistory.map((r, i) => (i === idx ? { ...r, name: newName } : r));
      setScoreRecords(updated);
      setEditingIdx(null);
    },
    [scoreHistory, setScoreRecords],
  );

  if (!scoreHistory.length) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--gray-3)' }}>
        <Text size="2" style={{ color: 'var(--gray-10)' }} className="italic">
          No games played yet.
        </Text>
      </div>
    );
  }

  const listHeight = Math.min(scoreHistory.length * ROW_HEIGHT, MAX_HEIGHT);

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--gray-5)' }}>
      <div className="grid grid-cols-5 bg-(--gray-3) px-3 py-2 text-xs font-semibold">
        <span>#</span>
        <span>Name</span>
        <span>Score</span>
        <span>Result</span>
        <span>Level</span>
      </div>

      <VirtualList
        items={scoreHistory}
        itemHeight={ROW_HEIGHT}
        height={listHeight}
        renderItem={(record, index) => (
          <ScoreHistoryRow
            key={record.id}
            record={record}
            index={index}
            isEditing={editingIdx === index}
            onEdit={setEditingIdx}
            onCancel={() => setEditingIdx(null)}
            onSave={handleSave}
          />
        )}
      />
    </div>
  );
}
