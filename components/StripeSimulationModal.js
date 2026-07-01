'use client';
import React from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';

export default function StripeSimulationModal({ photo, price, onClose, onPaymentSuccess }) {
  return (
    <div className="fixed inset-0 bg-[#102016]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative border">
        <button onClick={onClose} className="absolute top-5 right-5 text-xl font-bold text-gray-400">×</button>
        <div className="bg-[#102016] p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full uppercase font-bold">Stripe Checkout</span>
            <h3 className="text-xl font-bold mt-1 text-white">EditGenlx Delivery</h3>
          </div>
          <span className="text-2xl font-black text-[#79c66a]">${price.toFixed(2)}</span>
        </div>
        <div className="p-8 space-y-6">
          <div className="bg-[#f0e8db]/50 p-4 rounded-2xl flex gap-3.5 items-center text-sm">
            <CreditCard className="w-5 h-5 text-[#4d9e57]" />
            <span className="font-bold truncate">{photo.filename}</span>
          </div>
          <div className="bg-yellow-50 border p-3 rounded-xl text-[11px] text-[#566258] flex gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
            <div>
              <span className="font-bold block text-yellow-800">Stripe Live Webhook Hook Placement</span>
              Replace the payment action triggers within this mock block to pass secure checkout configurations.
            </div>
          </div>
          <button onClick={onPaymentSuccess} className="w-full bg-[#4d9e57] text-white font-extrabold py-3.5 rounded-full text-sm">
            Confirm Mock Checkout
          </button>
        </div>
      </div>
    </div>
  );
}