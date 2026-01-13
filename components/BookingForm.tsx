
import React, { useState } from 'react';

interface BookingFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: { name: string; email: string; phone: string; date: string }) => void;
    planTitle?: string;
    actionType: 'booking' | 'plan_selection';
}

const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, onSubmit, planTitle, actionType }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (!formData.name || !formData.email) {
            setError('Name and email are required');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Date validation if actionType is booking
        if (actionType === 'booking' && !formData.date) {
            setError('Preferred date is required for booking');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form
            setFormData({ name: '', email: '', phone: '', date: '' });
            onClose();
        } catch (err) {
            setError('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const title = actionType === 'booking' ? 'Book Your Session' : `Select ${planTitle}`;
    const subtitle = actionType === 'booking'
        ? 'Enter your details to book a session with PettyFitness 22'
        : 'Enter your details to select this plan';

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 my-8 relative" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="mb-6">
                    <h2 className="font-bebas text-4xl italic text-white mb-2">{title}</h2>
                    <p className="text-zinc-400 text-sm">{subtitle}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl text-white focus:border-orange-brand focus:outline-none transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl text-white focus:border-orange-brand focus:outline-none transition-colors"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                            Phone Number (Optional)
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl text-white focus:border-orange-brand focus:outline-none transition-colors"
                            placeholder="(980) 421-6801"
                        />
                    </div>

                    {actionType === 'booking' && (
                        <div>
                            <label htmlFor="date" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                                Preferred Date *
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required={actionType === 'booking'}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl text-white focus:border-orange-brand focus:outline-none transition-colors"
                            />
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl uppercase text-sm tracking-wider transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-orange-brand hover:bg-orange-600 text-black font-bold rounded-xl uppercase text-sm tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default BookingForm;
