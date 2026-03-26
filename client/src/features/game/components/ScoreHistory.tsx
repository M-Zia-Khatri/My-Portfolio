import { Table, Text } from '@radix-ui/themes';
import { useCallback, useState } from 'react';
import useGameSet from '../store/GameSetStore';
import MemoizedScoreRow from './ScoreRow';

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
      <div className="max-h-75 overflow-y-auto">
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
          <Table.Body>
            {scoreHistory.map((record, idx) => (
              <MemoizedScoreRow
                key={record.id}
                record={record}
                idx={idx}
                isEditing={editingIdx === idx}
                onEdit={() => setEditingIdx(idx)}
                onCancel={() => setEditingIdx(null)}
                onSave={(newName) => handleUpdateName(idx, newName)}
              />
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
}
