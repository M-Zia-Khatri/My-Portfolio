import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  email: string;
}

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (body) => {
      const res = await api.post("/auth/login", body);
      return res.data.data; 
    },
  });
};
