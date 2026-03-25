import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data.data;
    },
    retry: false,
  });
};