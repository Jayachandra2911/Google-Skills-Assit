import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, ShoppingCart, Trash2, Plus, Minus, Sparkles, QrCode, Smartphone } from "lucide-react";

const ASSISTANCE_TYPES = [
  { id: "quiz", name: "Quiz Support", price: 10 },
  { id: "lab", name: "Normal Lab Support", price: 25 },
  { id: "challenge", name: "Challenge Lab Mentorship", price: 50 },
  { id: "quiz_bundle", name: "5 Quiz Supports (Bundle)", price: 40, isBundle: true },
  { id: "lab_bundle", name: "3 Lab Supports (Bundle)", price: 60, isBundle: true },
];

const COURSES = [
  "Prompt Engineering",
  "LLM Fundamentals",
  "Embeddings & Vector Search",
  "Gemini / OpenAI API Integration",
  "RAG Systems",
  "Responsible AI",
];

export default function Checkout() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCourse = queryParams.get("course");

  const { cart, addToCart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const [formData, setFormData] = useState({
    courseName: initialCourse || COURSES[0],
    notes: "",
    phone: "",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Cart & Details */}
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <ShoppingCart className="text-emerald-600" /> Select Assistance
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {ASSISTANCE_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => addToCart(type)}
                  className={`p-6 rounded-2xl border transition-all text-center group relative overflow-hidden ${type.isBundle ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}
                >
                  {type.isBundle && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-tighter">
                      Bundle
                    </div>
                  )}
                  <div className="text-sm font-bold text-slate-900 mb-1">{type.name}</div>
                  <div className="text-xl font-bold text-emerald-600">₹{type.price}</div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-600">+ Add to Cart</div>
                </button>
              ))}
            </div>

            {cart.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Selection</h3>
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">₹{item.price} per unit</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-emerald-600"><Minus size={16} /></button>
                        <span className="font-bold text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-emerald-600"><Plus size={16} /></button>
                      </div>
                      <div className="text-sm font-bold text-slate-900 w-16 text-right">₹{item.price * item.quantity}</div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
                  <span className="text-lg font-bold text-slate-900">Total Amount</span>
                  <span className="text-3xl font-extrabold text-emerald-600">₹{totalAmount}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 italic border-2 border-dashed border-slate-100 rounded-2xl">
                Your cart is empty. Select an assistance type above.
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Request Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Course Name</label>
                <select 
                  value={formData.courseName}
                  onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                >
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Additional Notes (Optional)</label>
                <textarea 
                  placeholder="Tell us about specific challenges or topics you need help with..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none h-32 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment */}
        <div className="lg:w-1/3">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <QrCode className="text-emerald-600" /> Google Pay Checkout
            </h2>

            <UPIPayment cart={cart} formData={formData} totalAmount={totalAmount} clearCart={clearCart} />

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-400 text-xs leading-relaxed">
                <ShieldCheck size={24} className="text-emerald-500 flex-shrink-0" />
                Your payment is secured. We support Google Pay and all UPI apps.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UPIPayment({ cart, formData, totalAmount, clearCart }: any) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(true); // Default to showing QR
  const [upiId, setUpiId] = useState("");

  const upiUrl = `upi://pay?pa=genaiassist@upi&pn=GenAI%20Assist%20Pro&am=${totalAmount}&cu=INR&tn=Assistance%20Payment`;

  const handlePaymentSuccess = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: user.displayName || "Student",
        userEmail: user.email,
        phone: formData.phone,
        courseName: formData.courseName,
        items: cart,
        assistanceType: cart.map((i: any) => i.name).join(", "),
        amount: totalAmount,
        paymentMethod: "Google Pay / UPI",
        paymentStatus: "Paid",
        orderStatus: "Pending",
        tasks: [
          { label: "Task Received", completed: false },
          { label: "Work In Progress", completed: false },
          { label: "Review Completed", completed: false },
          { label: "Final Verification", completed: false },
          { label: "Mark as Completed", completed: false },
        ],
        notes: formData.notes,
        createdAt: serverTimestamp(),
      });

      clearCart();
      navigate("/success", { state: { orderId: orderRef.id } });
    } catch (err) {
      console.error("Payment Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-blue-50">
          <img src="https://www.gstatic.com/images/branding/product/2x/google_pay_96dp.png" alt="GPay" className="w-6 h-6" referrerPolicy="no-referrer" />
        </div>
        <div>
          <div className="text-sm font-bold text-blue-900">Google Pay Enabled</div>
          <div className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">Dynamic QR for ₹{totalAmount}</div>
        </div>
      </div>

      <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
        {showQR ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm inline-block border border-slate-100">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`} 
                alt="Google Pay QR Code" 
                className="w-44 h-44 mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900">Scan with Google Pay</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                Amount: ₹{totalAmount}
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4 opacity-50" referrerPolicy="no-referrer" />
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <QrCode size={32} />
            </div>
            <button 
              onClick={() => setShowQR(true)}
              className="text-emerald-600 text-xs font-bold hover:underline"
            >
              Show Payment QR
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <a 
          href={upiUrl}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 md:hidden"
        >
          <Smartphone size={18} /> Open Google Pay
        </a>
        
        <div className="relative flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Verification</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        <button 
          onClick={handlePaymentSuccess}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Confirming..." : "I've Completed the Payment"}
        </button>
        
        <p className="text-[10px] text-center text-slate-400 leading-relaxed">
          After scanning and paying ₹{totalAmount}, click the button above to confirm. 
          Our team will verify the transaction instantly.
        </p>
      </div>
    </div>
  );
}
