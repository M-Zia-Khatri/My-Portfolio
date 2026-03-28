import type { ApiSkill } from '@/features/skills/types';
import { api } from '@/shared/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSkillsData = () => {
  return useQuery<ApiSkill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      const res = await api.get('/skills');
      return res.data.data;
    },
  });
};

export const useCreateSkill = (onError?: (err: unknown) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSkill: unknown) => api.post('/skills', newSkill),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
    onError,
  });
};

export const useUpdateSkill = (onError?: (err: unknown) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patch(`/skills/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
    onError,
  });
};

export const useDeleteSkill = (onError?: (err: unknown) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/skills/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
    onError,
  });
};
