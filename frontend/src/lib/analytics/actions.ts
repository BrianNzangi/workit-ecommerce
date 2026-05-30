import { apiClient } from "@/lib/api/api-client"

export async function trackView(productIdOrSlug: string): Promise<void> {
    try {
        await apiClient.post(`/products/${productIdOrSlug}/view`)
    } catch {
        // silently ignore tracking failures
    }
}
