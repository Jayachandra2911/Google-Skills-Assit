import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc, query, orderBy, getDocs } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, ShoppingCart, Trash2, Plus, Minus, Sparkles, QrCode, Smartphone, ArrowRight } from "lucide-react";

const ASSISTANCE_TYPES = [
  { id: "quiz", name: "Quiz Support", price: 10 },
  { id: "lab", name: "Normal Lab Support", price: 25 },
  { id: "challenge", name: "Challenge Lab Mentorship", price: 50 },
  { id: "quiz_bundle", name: "5 Quiz Supports (Bundle)", price: 40, isBundle: true },
  { id: "lab_bundle", name: "3 Lab Supports (Bundle)", price: 60, isBundle: true },
];

export default function Checkout() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCourse = queryParams.get("course");

  const { cart, addToCart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");
  const [formData, setFormData] = useState({
    courseName: initialCourse || "",
    notes: "",
    phone: "",
  });

  React.useEffect(() => {
    const fetchCourses = async () => {
      const q = query(collection(db, "courses"), orderBy("title", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setCourses(data);
      if (!initialCourse && data.length > 0) {
        setFormData(prev => ({ ...prev, courseName: data[0].title }));
      }
    };
    fetchCourses();
  }, [initialCourse]);

  React.useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile(data);
          setFormData(prev => ({ ...prev, phone: data.phone || "" }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Cart & Details */}
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-tight">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="text-emerald-600" size={24} />
              </div>
              Select Assistance
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {ASSISTANCE_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => addToCart(type)}
                  className={`p-8 rounded-3xl border-2 transition-all text-center group relative overflow-hidden ${type.isBundle ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-50 bg-slate-50/30 hover:border-emerald-500 hover:bg-white'}`}
                >
                  {type.isBundle && (
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                      Bundle
                    </div>
                  )}
                  <div className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tight">{type.name}</div>
                  <div className="text-2xl font-black text-emerald-600">₹{type.price}</div>
                  <div className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-600 transition-colors">+ Add to Cart</div>
                </button>
              ))}
            </div>

            {cart.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-slate-100" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Your Selection</h3>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div>
                      <div className="font-black text-slate-900 uppercase tracking-tight">{item.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">₹{item.price} per unit</div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-emerald-600 transition-colors"><Minus size={16} /></button>
                        <span className="font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-emerald-600 transition-colors"><Plus size={16} /></button>
                      </div>
                      <div className="text-lg font-black text-slate-900 w-20 text-right">₹{item.price * item.quantity}</div>
                      <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-10">
                  <span className="text-xl font-black text-slate-900 uppercase tracking-tight">Total Amount</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-emerald-600">₹{totalAmount}</span>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inclusive of all taxes</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 italic border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ShoppingCart size={32} className="opacity-20" />
                </div>
                Your cart is empty. Select an assistance type above.
              </div>
            )}
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Request Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Course Name</label>
                <select 
                  value={formData.courseName}
                  onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all font-bold text-slate-700 bg-slate-50/30"
                >
                  {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Phone Number (Mandatory)</label>
                <div className="relative">
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="tel" 
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all font-bold text-slate-700 bg-slate-50/30"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Additional Notes (Optional)</label>
                <textarea 
                  placeholder="Tell us about specific challenges or topics you need help with..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none h-32 resize-none transition-all font-bold text-slate-700 bg-slate-50/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment */}
        <div className="lg:w-1/3">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
            <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-emerald-600" size={20} />
              </div>
              Payment Method
            </h2>

            <div className="space-y-4 mb-8">
              <button 
                onClick={() => setPaymentMethod("online")}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${paymentMethod === "online" ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "online" ? 'border-emerald-500' : 'border-slate-300'}`}>
                  {paymentMethod === "online" && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                </div>
                <div>
                  <div className="font-black text-slate-900 uppercase tracking-tight text-sm">Online Payment</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Razorpay / UPI / Cards</div>
                </div>
              </button>

              <button 
                onClick={() => setPaymentMethod("cash")}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${paymentMethod === "cash" ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cash" ? 'border-emerald-500' : 'border-slate-300'}`}>
                  {paymentMethod === "cash" && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                </div>
                <div>
                  <div className="font-black text-slate-900 uppercase tracking-tight text-sm">Cash Option</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pay in Person</div>
                </div>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-red-50 border border-red-100 mb-8">
              <p className="text-red-700 font-black text-center text-sm uppercase tracking-tight leading-relaxed">
                [ ONCE YOUR PAYMENT IS DONE, ONLY THE ASSISTANTSHIP WILL START ]
              </p>
            </div>

            <PaymentSection 
              cart={cart} 
              formData={formData} 
              totalAmount={totalAmount} 
              clearCart={clearCart} 
              paymentMethod={paymentMethod}
            />

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
                Secure Checkout • 256-bit Encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentSection({ cart, formData, totalAmount, clearCart, paymentMethod }: any) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    if (!formData.phone || formData.phone.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

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
        paymentMethod: paymentMethod === "online" ? "Razorpay (Online)" : "Cash",
        paymentStatus: "Pending",
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

      if (paymentMethod === "online") {
        // Redirect to Razorpay
        window.location.href = "https://razorpay.me/@jayachandrasaikotapati";
      } else {
        navigate("/success", { state: { orderId: orderRef.id, isCash: true } });
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {paymentMethod === "online" ? (
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Smartphone className="text-emerald-600" size={24} />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 uppercase tracking-tight">Instant Activation</div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Via Razorpay Secure</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            You will be redirected to our secure Razorpay portal. Please enter the amount <span className="font-black text-slate-900">₹{totalAmount}</span> on the payment page.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Smartphone className="text-amber-600" size={24} />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 uppercase tracking-tight">Manual Verification</div>
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Admin will contact you</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            The admin will contact you shortly to coordinate the cash collection or provide instructions on where to submit the amount.
          </p>
        </div>
      )}

      <button 
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.1em] text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${
          paymentMethod === "online" 
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200' 
            : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
        } disabled:opacity-50`}
      >
        {loading ? (
          "Processing..."
        ) : (
          <>
            {paymentMethod === "online" ? "Pay Now & Start" : "Confirm Cash Request"}
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}
