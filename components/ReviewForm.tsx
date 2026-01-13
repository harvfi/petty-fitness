
import React, { useState } from 'react';
import { Testimonial } from '../types';
import { saveTestimonial } from '../services/dataService';

interface ReviewFormProps {
    userName: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ userName }) => {
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewText.trim()) {
            alert('Please write a review before submitting.');
            return;
        }

        const newReview: Testimonial = {
            id: `review-${Date.now()}`,
            name: userName,
            content: reviewText,
            date: new Date().toISOString(),
        };

        saveTestimonial(newReview);
        setReviewText('');
        setReviewRating(5);
        setReviewSubmitted(true);

        setTimeout(() => setReviewSubmitted(false), 5000);
    };

    return (
        <div className="mt-12">
            <h2 className="font-bebas text-4xl italic mb-8 uppercase">Leave a Review</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
                {reviewSubmitted ? (
                    <div className="text-center py-12 animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-[#d4ff00]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-[#d4ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bebas italic text-white mb-2">Thank You!</h3>
                        <p className="text-zinc-400">Your review has been submitted and will appear on our testimonials page.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-3">
                                Your Rating
                            </label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className="transition-all hover:scale-110"
                                    >
                                        <svg
                                            className={`w-8 h-8 ${star <= reviewRating ? 'text-[#d4ff00] fill-current' : 'text-zinc-700'}`}
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-3">
                                Your Review
                            </label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience with PettyFitness 22..."
                                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-white placeholder-zinc-600 focus:border-[#d4ff00] focus:outline-none transition-all min-h-[150px] resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#d4ff00] text-black px-8 py-4 rounded-full font-bold uppercase text-sm shadow-lg hover:shadow-[#d4ff00]/20 transition-all hover:scale-105 active:scale-95"
                        >
                            Submit Review
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReviewForm;
