import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Star, Send, CheckCircle2, MessageSquare } from "lucide-react";

export default function Feedback() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId));
        if (orderDoc.exists()) {
          setOrder(orderDoc.data());
        }
      } catch (error: any) {
        console.warn("Feedback: Error fetching order (might be offline):", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !order) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        orderId,
        userId: user.uid,
        userName: user.displayName || "Student",
        courseName: order.courseName,
        rating,
        review,
        recommend,
        approved: false,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return <div className="h-screen flex items-center justify-center">Order not found</div>;

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Thank You!</h1>
          <p className="text-slate-600 mb-8">Your feedback helps us improve and helps other students make better choices.</p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Share Your Experience</h1>
          <p className="text-slate-500">How was your mentorship for <span className="text-emerald-600 font-bold">{order.courseName}</span>?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating */}
          <div className="text-center">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star 
                    size={40} 
                    fill={star <= rating ? "#10b981" : "none"} 
                    className={star <= rating ? "text-emerald-500" : "text-slate-200"} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Review Text</label>
            <textarea
              required
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you like? How did the mentor help you?"
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none h-40 resize-none transition-all"
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Would you recommend us?</label>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`flex-1 py-4 rounded-xl font-bold border transition-all ${recommend === true ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-500"}`}
              >
                Yes, Absolutely
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`flex-1 py-4 rounded-xl font-bold border transition-all ${recommend === false ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-100" : "bg-white text-slate-600 border-slate-200 hover:border-slate-900"}`}
              >
                No
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || recommend === null}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? "Submitting..." : "Submit Feedback"} <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
