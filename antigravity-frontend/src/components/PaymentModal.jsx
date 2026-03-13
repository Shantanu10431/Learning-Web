import React, { useState } from 'react';
import { CreditCard, Smartphone, X, CheckCircle } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, courseTitle, price, onComplete }) => {
    const [method, setMethod] = useState('upi'); // upi or card
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handlePayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onComplete();
            }, 1500);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle size={64} className="text-emerald-500 mb-6 animate-bounce" />
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                        <p className="text-slate-400">Redirecting to course...</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-2">Secure Checkout</h2>
                        <p className="text-slate-400 mb-6">{courseTitle}</p>

                        <div className="bg-slate-800 rounded-xl p-4 mb-6 flex justify-between items-center border border-slate-700">
                            <span className="text-slate-300">Total Amount</span>
                            <span className="text-2xl font-bold text-emerald-400">₹{price}</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${method === 'upi' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                <input type="radio" name="payment_method" value="upi" checked={method === 'upi'} onChange={() => setMethod('upi')} className="hidden" />
                                <Smartphone className={`mr-4 ${method === 'upi' ? 'text-indigo-400' : 'text-slate-500'}`} size={24} />
                                <div>
                                    <div className="font-bold text-slate-200">UPI / QR Code</div>
                                    <div className="text-sm text-slate-400">Google Pay, PhonePe, Paytm</div>
                                </div>
                            </label>

                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${method === 'card' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                <input type="radio" name="payment_method" value="card" checked={method === 'card'} onChange={() => setMethod('card')} className="hidden" />
                                <CreditCard className={`mr-4 ${method === 'card' ? 'text-indigo-400' : 'text-slate-500'}`} size={24} />
                                <div>
                                    <div className="font-bold text-slate-200">Credit / Debit Card</div>
                                    <div className="text-sm text-slate-400">Visa, MasterCard, RuPay</div>
                                </div>
                            </label>
                        </div>

                        {method === 'upi' && (
                            <div className="mb-6 space-y-3">
                                <input type="text" placeholder="Enter UPI ID (e.g. user@okicici)" className="w-full bg-slate-800 border-b border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-indigo-500 rounded-lg" />
                            </div>
                        )}

                        {method === 'card' && (
                            <div className="mb-6 space-y-3">
                                <input type="text" placeholder="Card Number" className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-indigo-500 rounded-lg" />
                                <div className="flex gap-3">
                                    <input type="text" placeholder="MM/YY" className="w-1/2 bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-indigo-500 rounded-lg" />
                                    <input type="text" placeholder="CVV" className="w-1/2 bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-indigo-500 rounded-lg" />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-lg"
                        >
                            {isProcessing ? 'Processing...' : `Pay ₹${price}`}
                        </button>
                        <div className="text-center mt-4 text-xs text-slate-500 flex items-center justify-center gap-2">
                            Payments are securely 256-bit encrypted
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
