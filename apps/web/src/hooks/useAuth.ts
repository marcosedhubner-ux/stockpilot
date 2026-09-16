import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { AuthenticatedStaff } from "@/lib/types";

interface StaffResponse {
  staff: AuthenticatedStaff;
}

export function useSession() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get<StaffResponse>("/auth/me"),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiClient.post<StaffResponse>("/auth/login", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
