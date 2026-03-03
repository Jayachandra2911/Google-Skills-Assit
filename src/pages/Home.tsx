import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArrowRight, CheckCircle2, Star, Sparkles, Code, Brain, Search, Terminal, Database, ShieldCheck, ShoppingCart, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const ICON_MAP: any = {
  Terminal: <Terminal className="text-emerald-500" />,
  Brain: <Brain className="text-blue-500" />,
  Database: <Database className="text-purple-500" />,
  Code: <Code className="text-orange-500" />,
  Search: <Search className="text-pink-500" />,
  ShieldCheck: <ShieldCheck className="text-cyan-500" />,
};

export default function Home() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestimonials = async () => {
      const q = query(collection(db, "feedback"), where("approved", "==", true));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestimonials(data);
    };
    const fetchCourses = async () => {
      const q = query(collection(db, "courses"), orderBy("title", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(data);
    };
    fetchTestimonials();
    fetchCourses();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-2xl shadow-slate-200">
                <Sparkles size={14} className="text-emerald-400" /> Premium EdTech Platform
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9] uppercase">
                Master <br />
                <span className="text-emerald-600">Generative AI</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Quiz Support, Lab Walkthroughs, and Challenge Mentorship. We don't just give answers; we build your expertise.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href="#courses" className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 group">
                  Browse Courses <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </a>
                <a href="#pricing" className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-emerald-600 transition-all">
                  View Pricing
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decoration - Brutalist Style */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-slate-50 opacity-50" />
        </div>
      </section>

      {/* Course Catalog */}
      <section id="courses" className="py-32 bg-slate-50 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <div className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Curriculum</div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">Explore Our Modules</h2>
              <p className="text-slate-500 mt-4 font-medium text-lg">Structured mentorship for every stage of your AI journey.</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-slate-200 mx-12 mb-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 hover:border-emerald-500 transition-all group shadow-sm hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  {React.cloneElement((ICON_MAP[course.icon] || ICON_MAP.Terminal) as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{course.title}</h3>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">{course.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.tags?.map((tag: string) => (
                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{course.difficulty}</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1"><Clock size={10} /> {course.duration}</span>
                  </div>
                  <button 
                    disabled={loading}
                    onClick={() => {
                      if (loading) return;
                      if (!user) {
                        navigate("/register");
                        return;
                      }
                      addToCart({ id: "quiz", name: "Quiz Support", price: course.price });
                      navigate(`/checkout?course=${encodeURIComponent(course.title)}`);
                    }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    ₹{course.price} <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Transparent Pricing</h2>
            <p className="text-slate-600">Choose the support level that fits your needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <PricingCard title="Quiz Support" price="₹10" features={["Step-by-step logic", "Concept clarification", "Quick turnaround"]} user={user} loading={loading} type="quiz" />
            <PricingCard title="Normal Lab Support" price="₹25" features={["Code walkthroughs", "Debugging assistance", "Environment setup"]} highlighted user={user} loading={loading} type="lab" />
            <PricingCard title="Challenge Lab" price="₹50" features={["Advanced mentorship", "Complex problem solving", "Architectural guidance"]} user={user} loading={loading} type="challenge" />
          </div>

          {/* Bundle Offer */}
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                  Bundle Offer
                </div>
                <h3 className="text-3xl font-bold mb-4">Save More with Bundles</h3>
                <p className="text-slate-400 max-w-md">Get consistent support throughout your course with our discounted credit packs.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  disabled={loading}
                  onClick={() => {
                    if (loading) return;
                    if (!user) { navigate("/register"); return; }
                    addToCart({ id: "quiz_bundle", name: "5 Quiz Supports (Bundle)", price: 40, isBundle: true });
                    navigate("/checkout");
                  }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center min-w-[200px] hover:bg-white/20 transition-all group disabled:opacity-50"
                >
                  <div className="text-emerald-400 font-bold mb-1">5 Quiz Supports</div>
                  <div className="text-3xl font-bold">₹40</div>
                  <div className="text-xs text-slate-400 line-through mt-1">Was ₹50</div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Buy Bundle</div>
                </button>
                <button 
                  disabled={loading}
                  onClick={() => {
                    if (loading) return;
                    if (!user) { navigate("/register"); return; }
                    addToCart({ id: "lab_bundle", name: "3 Lab Supports (Bundle)", price: 60, isBundle: true });
                    navigate("/checkout");
                  }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center min-w-[200px] hover:bg-white/20 transition-all group disabled:opacity-50"
                >
                  <div className="text-emerald-400 font-bold mb-1">3 Lab Supports</div>
                  <div className="text-3xl font-bold">₹60</div>
                  <div className="text-xs text-slate-400 line-through mt-1">Was ₹75</div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Buy Bundle</div>
                </button>
              </div>
            </div>
            {/* Animated Discount Badge */}
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 font-black text-sm text-center leading-tight -rotate-12"
            >
              20% <br /> OFF
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Student Success Stories</h2>
            <p className="text-slate-600">Hear from those who mastered GenAI with our help.</p>
          </div>
          
          <div className="relative h-[300px]">
            {testimonials.length > 0 ? (
              <TestimonialCarousel items={testimonials} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic">
                No testimonials yet. Be the first to share your journey!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function PricingCard({ title, price, features, highlighted = false, user, loading, type }: any) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuy = () => {
    if (loading) return;
    if (!user) {
      navigate("/register");
      return;
    }
    
    const itemMap: any = {
      quiz: { id: "quiz", name: "Quiz Support", price: 10 },
      lab: { id: "lab", name: "Normal Lab Support", price: 25 },
      challenge: { id: "challenge", name: "Challenge Lab Mentorship", price: 50 },
    };

    if (itemMap[type]) {
      addToCart(itemMap[type]);
    }
    navigate("/checkout");
  };

  return (
    <div className={`p-8 rounded-3xl border ${highlighted ? 'bg-white border-emerald-500 shadow-xl scale-105 z-10' : 'bg-white border-slate-200 shadow-sm'} transition-all`}>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-bold text-slate-900">{price}</span>
        <span className="text-slate-500 text-sm">/ assistance</span>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <button 
        disabled={loading}
        onClick={handleBuy}
        className={`w-full block text-center py-3 rounded-xl font-bold transition-all disabled:opacity-50 ${highlighted ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
      >
        {loading ? "Checking..." : (user ? "Buy Now" : "Get Started")}
      </button>
    </div>
  );
}

function TestimonialCarousel({ items }: { items: any[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="relative w-full max-w-3xl mx-auto h-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 text-center"
        >
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(items[index].rating)].map((_, i) => (
              <Star key={i} size={20} fill="#10b981" className="text-emerald-500" />
            ))}
          </div>
          <p className="text-xl text-slate-700 italic mb-8 leading-relaxed">
            "{items[index].review}"
          </p>
          <div>
            <div className="font-bold text-slate-900 text-lg">{items[index].userName || "Student"}</div>
            <div className="text-emerald-600 text-sm font-medium">{items[index].courseName}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
