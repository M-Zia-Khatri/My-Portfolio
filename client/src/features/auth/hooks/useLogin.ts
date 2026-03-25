import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const res = await api.post("/auth/login", body);
      return res.data;
    },
  });
};
