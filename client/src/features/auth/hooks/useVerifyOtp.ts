import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";
import { setAccessToken } from "../utils/tokenManager";

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (body: { email: string; otp: string }) => {
      const res = await api.post("/auth/verify-otp", body);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      // refreshToken already in cookie (if backend sets it)
    },
  });
};
