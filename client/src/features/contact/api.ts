import { api } from '@/shared/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Contact } from './types';

export type ContactFormData = {
  fullName: string;
  email: string;
  message: string;
};

export const contactKeys = {
  all: ['contacts'] as const,
};

export const submitContactForm = async (payload: ContactFormData): Promise<void> => {
  await api.post('/contact', payload);
};

export const useContacts = () => {
  return useQuery<Contact[]>({
    queryKey: contactKeys.all,
    queryFn: async () => {
      const response = await api.get('/contact');

      // 1. If API returns the array directly: [{}, {}]
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // 2. If API wraps it in an object: { data: [{}, {}] }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // 3. If API wraps it in a named property: { contacts: [{}, {}] }
      if (response.data && Array.isArray(response.data.contacts)) {
        return response.data.contacts;
      }

      // Fallback to empty array to prevent .filter() crashes
      return [];
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contact/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
};
