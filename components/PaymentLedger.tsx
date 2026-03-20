"use client";

import { useState } from 'react';
import { Wallet, Plus, CreditCard, Banknote, Calendar, CheckCircle, Lock } from 'lucide-react';
import { logPayment } from '@/app/actions/finance';

export default function PaymentLedger({
    bookingId,
    totalPrice,
    amountPaid,
    payments = [],
    allowPartialPayments,
    canManage
}: {
    bookingId: string,
    totalPrice: number | string,
    amountPaid: number | string,
    payments: any[],
    allowPartialPayments: boolean,
    canManage: boolean
}) {
    const [isLogging, setIsLogging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Bank Transfer');
    const [notes, setNotes] = useState('');
    
    // 1. Define the colors clearly so Tailwind finds them
    const bgColor = allowPartialPayments ? 'bg-blue-600' : 'bg-green-600';
    const hoverColor = allowPartialPayments ? 'hover:bg-blue-700' : 'hover:bg-green-700';

    // 2. We use an inline style for the background-color as a safety net
    const hexColor = allowPartialPayments ? '#2563eb' : '#16a34a';

    // THE FIX: Bulletproof parsing! Converts toString first, removes commas, then casts to Number.
    const safeTotalPrice = Number(totalPrice?.toString().replace(/,/g, '')) || 0;
    const safeAmountPaid = Number(amountPaid?.toString().replace(/,/g, '')) || 0;

    const balanceDue = safeTotalPrice - safeAmountPaid;

    // Safely calculate percentage (0 to 100)
    let progressPercent = safeTotalPrice > 0 ? (safeAmountPaid / safeTotalPrice) * 100 : 0;
    if (progressPercent > 100) progressPercent = 100;
    if (progressPercent < 0 || isNaN(progressPercent)) progressPercent = 0;

    const isFullyPaid = balanceDue <= 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalAmount = allowPartialPayments ? Number(amount) : balanceDue;

        if (!finalAmount || isNaN(finalAmount)) return;

        setIsLoading(true);
        await logPayment(bookingId, finalAmount, method, notes);

        setAmount('');
        setNotes('');
        setIsLogging(false);
        setIsLoading(false);
    };

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .pl-container { background-color: #1E293B !important; border-color: #334155 !important; }
                html.dark .pl-border { border-color: #334155 !important; }
                
                html.dark .pl-text-primary { color: #FFFFFF !important; }
                html.dark .pl-text-secondary { color: #94A3B8 !important; }
                html.dark .pl-text-green { color: #4ADE80 !important; }
                html.dark .pl-text-orange { color: #FB923C !important; }

                /* Progress Bar */
                html.dark .pl-progress-bg { background-color: #0F172A !important; }

                /* Form Elements */
                html.dark .pl-form-bg { background-color: rgba(15, 23, 42, 0.5) !important; border-color: #334155 !important; }
                html.dark .pl-input { background-color: #0F172A !important; border-color: #334155 !important; color: white !important; }
                html.dark .pl-input:focus { border-color: #3B82F6 !important; }
                html.dark .pl-input-disabled { background-color: #1E293B !important; border-color: #334155 !important; color: #94A3B8 !important; }

                /* Transaction Cards */
                html.dark .pl-card-bg { background-color: #0F172A !important; border-color: #334155 !important; }
                html.dark .pl-icon-bg { background-color: #1E293B !important; border-color: #334155 !important; }
                
                html.dark .pl-badge-green { background-color: rgba(34, 197, 94, 0.1) !important; color: #4ADE80 !important; }
                html.dark .pl-badge-blue { background-color: rgba(59, 130, 246, 0.1) !important; color: #60A5FA !important; }
                html.dark .pl-badge-blue-hover:hover { background-color: rgba(59, 130, 246, 0.2) !important; }
                html.dark .pl-badge-green-hover:hover { background-color: rgba(34, 197, 94, 0.2) !important; }
            `}</style>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8 transition-colors pl-container">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 pl-border">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 pl-text-secondary">
                        <Wallet size={16} className="text-blue-500" />
                        Financial Ledger
                    </h3>

                    {canManage && !isFullyPaid && (
                        <button
                            onClick={() => setIsLogging(!isLogging)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${allowPartialPayments
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 pl-badge-blue pl-badge-blue-hover'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100 pl-badge-green pl-badge-green-hover'
                                }`}
                        >
                            {isLogging ? 'Cancel' : (
                                allowPartialPayments
                                    ? <><Plus size={14} /> Log Payment</>
                                    : <><CheckCircle size={14} /> Mark Full Paid</>
                            )}
                        </button>
                    )}
                </div>

                {/* PROGRESS BAR */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-black mb-2">
                        <span className="text-gray-500 pl-text-secondary">Paid: Rs. {safeAmountPaid.toLocaleString()}</span>
                        <span className={isFullyPaid ? "text-green-600 pl-text-green" : "text-orange-500 pl-text-orange"}>
                            {isFullyPaid ? "Fully Paid" : `Due: Rs. ${balanceDue.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden transition-colors pl-progress-bg">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${progressPercent}%`,
                                backgroundColor: isFullyPaid ? '#22c55e' : '#3b82f6'
                            }}
                        ></div>
                    </div>
                </div>

                {/* LOG PAYMENT FORM */}
                {isLogging && (
                    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 animate-fadeIn transition-colors pl-form-bg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pl-text-secondary">Amount (Rs.)</label>
                                {allowPartialPayments ? (
                                    <input
                                        type="number"
                                        required
                                        max={balanceDue}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 transition-colors pl-input"
                                        placeholder={`Max: ${balanceDue}`}
                                    />
                                ) : (
                                    <div className="w-full p-3 bg-gray-200 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 flex justify-between items-center select-none cursor-not-allowed transition-colors pl-input-disabled">
                                        <span>{balanceDue.toLocaleString()}</span>
                                        <Lock size={14} className="text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pl-text-secondary">Method</label>
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 cursor-pointer transition-colors pl-input"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pl-text-secondary">Reference / Notes (Optional)</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-colors pl-input"
                                    placeholder="e.g., Txn ID: 123456789"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ backgroundColor: hexColor }} 
                            className={`w-full text-white font-bold py-3 rounded-lg text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center ${bgColor} ${hoverColor}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </div>
                            ) : (
                                <span className="text-white">
                                    {allowPartialPayments ? 'Save Payment' : 'Confirm Full Payment'}
                                </span>
                            )}
                        </button>
                    </form>
                )}

                {/* TRANSACTION HISTORY */}
                <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-text-secondary">Transaction History</h4>
                    {payments.length === 0 ? (
                        <p className="text-sm text-gray-400 italic pl-text-secondary">No payments logged yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 transition-colors pl-card-bg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-green-600 shrink-0 transition-colors pl-icon-bg pl-text-green">
                                            {payment.method.includes('Card') ? <CreditCard size={14} /> : <Banknote size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 pl-text-primary">Rs. {payment.amount.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 pl-text-secondary">
                                                <Calendar size={10} /> {new Date(payment.date).toLocaleDateString()} • {payment.method}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] font-black uppercase transition-colors pl-badge-green">
                                            <CheckCircle size={10} /> Cleared
                                        </span>
                                        {payment.recordedBy && (
                                            <p className="text-[9px] text-gray-400 mt-1 pl-text-secondary">by {payment.recordedBy}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}