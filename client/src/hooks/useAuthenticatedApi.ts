import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export function useAuthenticatedApi() {
    const { user } = useAuth();

    const authenticatedApiRequest = async (
        method: string,
        url: string,
        data?: unknown | undefined,
    ): Promise<Response> => {
        return apiRequest(method, url, data, user?.id);
    };

    return { authenticatedApiRequest };
}
