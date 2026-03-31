import { Flex, Select } from '@radix-ui/themes';
import { useState } from 'react';
import useGameSet from '../store/GameSetStore';
import CustomLevelDialog from './CustomLevelDialog';

const BUILTIN_PRESETS: Record<string, { max: number; limit: number; time: number }> = {
  easy: { max: 20, limit: 10, time: 180 },
  normal: { max: 20, limit: 7, time: 180 },
  hard: { max: 30, limit: 4, time: 120 },
  'very-hard': { max: 30, limit: 1, time: 60 },
};

export default function SelDifficultLevel() {
  const {
    difficultLevel,
    setDifficultLevel,
    setMaxNumber,
    setGuessLimit,
    setTimeLimit,
    customLevels,
  } = useGameSet();

  const [dialogOpen, setDialogOpen] = useState(false);
  const selectedValue = customLevels.find((lvl) => lvl.name === difficultLevel)?.id ?? difficultLevel;

  const handleChange = (val: string) => {
    // Special sentinel — open dialog instead of selecting
    if (val === '__add_custom__') {
      setDialogOpen(true);
      return;
    }

    if (BUILTIN_PRESETS[val]) {
      setDifficultLevel(val);
      const { max, limit, time } = BUILTIN_PRESETS[val];
      setMaxNumber(max);
      setGuessLimit(limit);
      setTimeLimit(time);
      return;
    }

    // User-created custom level — val is lvl.id
    const custom = customLevels.find((l) => l.id === val);
    if (custom) {
      setDifficultLevel(custom.name); // store readable name, not id
      setMaxNumber(custom.maxNumber);
      setGuessLimit(custom.guessLimit);
      setTimeLimit(custom.totalSeconds);
    }
  };

  return (
    <Flex align="center" gap="1">
      <Select.Root value={selectedValue} onValueChange={handleChange}>
        <Select.Trigger variant="surface" color="blue" style={{ width: 160 }} />
        <Select.Content color="blue" variant="soft">
          {/* Built-in levels */}
          <Select.Group>
            <Select.Label>Built-in</Select.Label>
            <Select.Item value="easy">Easy</Select.Item>
            <Select.Item value="normal">Normal</Select.Item>
            <Select.Item value="hard">Hard</Select.Item>
            <Select.Item value="very-hard">Very Hard</Select.Item>
          </Select.Group>

          {/* User custom levels */}
          {customLevels.length > 0 && (
            <Select.Group>
              <Select.Separator />
              <Select.Label>Custom</Select.Label>
              {customLevels.map((lvl) => (
                <Select.Item key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </Select.Item>
              ))}
            </Select.Group>
          )}

          {/* Add custom level trigger */}
          <Select.Separator />
          <Select.Group>
            <Select.Item value="__add_custom__">+ Add Custom Level</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>

      <CustomLevelDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Flex>
  );
}
