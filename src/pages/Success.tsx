import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, ArrowRight, Calendar, FileText } from "lucide-react";

export default function Success() {
  const location = useLocation();
  const orderId = location.state?.orderId || "N/A";
  const isCash = location.state?.isCash || false;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 ${isCash ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
          <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {isCash ? "Request Submitted!" : "Payment Successful!"}
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          {isCash 
            ? "Your cash payment request has been received. The admin will contact you shortly regarding the payment collection." 
            : "Your assistance request has been received. Our mentors will start working on it shortly. You'll receive an email confirmation soon."}
        </p>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 text-left">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
            <span className="text-sm font-mono font-bold text-slate-900">#{orderId.slice(0, 12)}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar size={16} className={isCash ? "text-amber-500" : "text-emerald-500"} />
              <span>{isCash ? "Awaiting Payment Confirmation" : "Estimated Start: Within 2-4 hours"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <FileText size={16} className={isCash ? "text-amber-500" : "text-emerald-500"} />
              <span>Status: {isCash ? "Pending Admin Contact" : "Pending Mentor Assignment"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            Go to Dashboard <ArrowRight size={18} />
          </Link>
          <Link to="/" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
