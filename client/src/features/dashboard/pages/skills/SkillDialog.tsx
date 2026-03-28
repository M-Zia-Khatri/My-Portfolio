import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Dialog, Flex, Select, Text, TextArea, TextField } from '@radix-ui/themes';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ICON_OPTIONS } from './iconMap'; // B7 fixed: ICON_OPTIONS now imported
import { skillSchema, type SkillFormValues } from './skills.schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SkillFormValues) => void;
  initialData?: any;
  isPending: boolean;
}

export default function SkillDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: { mode: 'code' },
  });

  useEffect(() => {
    if (initialData) {
      const content =
        initialData.mode === 'code'
          ? initialData.code.join('\n')
          : initialData.commands.map((c: any) => c.text || '').join('\n');

      reset({
        ...initialData,
        // B6 fixed: API returns `icon` (string); form schema field is `iconName`.
        iconName: initialData.icon ?? initialData.iconName ?? ICON_OPTIONS[0],
        content,
      });
    } else {
      reset({ mode: 'code', color: '#61dafb', iconName: ICON_OPTIONS[0] });
    }
  }, [initialData, reset, open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="500px">
        <Dialog.Title>{initialData ? 'Edit Skill' : 'Add New Skill'}</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3">
            <Box>
              <Text as="label" size="2" weight="bold">
                Skill Name
              </Text>
              <TextField.Root placeholder="e.g. React" {...register('name')} />
              {errors.name && (
                <Text color="red" size="1">
                  {errors.name.message}
                </Text>
              )}
            </Box>

            <Flex gap="3">
              <Box className="flex-1">
                <Text as="label" size="2" weight="bold">
                  Language
                </Text>
                <TextField.Root placeholder="tsx" {...register('lang')} />
              </Box>
              <Box className="flex-1">
                <Text as="label" size="2" weight="bold">
                  Color (Hex)
                </Text>
                <TextField.Root {...register('color')} />
              </Box>
            </Flex>

            <Flex gap="3">
              <Box className="flex-1">
                <Text as="label" size="2" weight="bold">
                  Mode
                </Text>
                <Select.Root value={watch('mode')} onValueChange={(v: any) => setValue('mode', v)}>
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    <Select.Item value="code">Code Editor</Select.Item>
                    <Select.Item value="terminal">Terminal</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
              <Box className="flex-1">
                <Text as="label" size="2" weight="bold">
                  Icon
                </Text>
                <Select.Root value={watch('icon')} onValueChange={(v) => setValue('icon', v)}>
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    {/* B7 fixed: ICON_OPTIONS is now a real import, not a ReferenceError */}
                    {ICON_OPTIONS.map((opt) => (
                      <Select.Item key={opt} value={opt}>
                        {opt}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            <Box>
              <Text as="label" size="2" weight="bold">
                File Name
              </Text>
              <TextField.Root placeholder="App.tsx" {...register('fileName')} />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Content (one per line)
              </Text>
              <TextArea
                placeholder="Enter code lines or terminal commands..."
                rows={6}
                {...register('content')}
              />
              {errors.content && (
                <Text color="red" size="1">
                  {errors.content.message}
                </Text>
              )}
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Skill'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
