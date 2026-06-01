"use client";

import { useState, useEffect } from "react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

interface Review {
    id: string;
    rating: number;
    title: string | null;
    comment: string;
    customerName: string;
    createdAt: string;
}

interface ReviewsData {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
}

export function ProductReviews({ productId }: { productId: string }) {
    const [data, setData] = useState<ReviewsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        setLoading(true);
        setFetchError(false);
        fetch(`/api/store/products/${productId}/reviews`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed");
                return res.json();
            })
            .then((json) => setData(json))
            .catch(() => setFetchError(true))
            .finally(() => setLoading(false));
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");

        if (!rating) {
            setFormError("Please select a rating");
            return;
        }
        if (!comment.trim()) {
            setFormError("Please write a comment");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/store/products/${productId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, title: title.trim() || undefined, comment: comment.trim() }),
            });
            const json = await res.json();
            if (json.success) {
                setFormSuccess("Review submitted! It will appear after approval.");
                setRating(0);
                setTitle("");
                setComment("");
            } else {
                setFormError(json.message || "Failed to submit review");
            }
        } catch {
            setFormError("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const reviews = data?.reviews ?? [];
    const averageRating = data?.averageRating ?? 0;
    const totalReviews = data?.totalReviews ?? 0;

    const heading = <h2 className="text-lg font-bold text-secondary-900 mb-4">Customer Reviews</h2>;

    if (loading) {
        return (
            <div>
                {heading}
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-100 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div>
                {heading}
                <p className="text-sm text-gray-500">Unable to load reviews.</p>
            </div>
        );
    }

    return (
        <div>
            {heading}

            {totalReviews > 0 && (
                <div className="mb-6 flex items-center gap-3">
                    <span className="text-2xl font-bold">{averageRating}</span>
                    <StarRating rating={Math.round(averageRating)} />
                    <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
                </div>
            )}

            {totalReviews > 0 ? (
                <div className="space-y-4 mb-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex items-center gap-2 mb-1">
                                <StarRating rating={review.rating} />
                                {review.title && (
                                    <span className="font-semibold text-sm">{review.title}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-1">
                                {review.customerName} &middot; {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 mb-6">No reviews yet. Be the first to review this product!</p>
            )}

            {authLoading ? null : isAuthenticated ? (
                <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
                    <h3 className="font-semibold text-sm">Write a Review</h3>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Rating</label>
                        <StarRating rating={rating} size={24} interactive onChange={setRating} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Title (optional)</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Summarize your review"
                            className="rounded-sm text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Comment</label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product"
                            rows={3}
                            className="rounded-sm text-sm"
                        />
                    </div>
                    {formError && <p className="text-sm text-red-500">{formError}</p>}
                    {formSuccess && <p className="text-sm text-green-600">{formSuccess}</p>}
                    <Button type="submit" disabled={submitting} className="rounded-sm text-sm">
                        {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </form>
            ) : (
                <p className="text-sm text-gray-500">
                    <a href="/login" className="text-primary-900 underline hover:text-[#e04500]">Sign in</a> to write a review.
                </p>
            )}
        </div>
    );
}
