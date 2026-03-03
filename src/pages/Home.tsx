import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArrowRight, CheckCircle2, Star, Sparkles, Code, Brain, Search, Terminal, Database, ShieldCheck, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const COURSES = [
  { id: 1, title: "Prompt Engineering", description: "Master the art of communicating with LLMs for optimal results.", difficulty: "Beginner", price: "₹10", icon: <Terminal className="text-emerald-500" /> },
  { id: 2, title: "LLM Fundamentals", description: "Deep dive into Transformer architectures and model training.", difficulty: "Intermediate", price: "₹25", icon: <Brain className="text-blue-500" /> },
  { id: 3, title: "Embeddings & Vector Search", description: "Learn how to store and retrieve semantic information.", difficulty: "Advanced", price: "₹50", icon: <Database className="text-purple-500" /> },
  { id: 4, title: "Gemini / OpenAI API", description: "Integrate powerful AI models into your own applications.", difficulty: "Intermediate", price: "₹25", icon: <Code className="text-orange-500" /> },
  { id: 5, title: "RAG Systems", description: "Build Retrieval-Augmented Generation pipelines for custom data.", difficulty: "Advanced", price: "₹50", icon: <Search className="text-pink-500" /> },
  { id: 6, title: "Responsible AI", description: "Ethics, bias mitigation, and safety in AI development.", difficulty: "Beginner", price: "₹10", icon: <ShieldCheck className="text-cyan-500" /> },
];

export default function Home() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestimonials = async () => {
      const q = query(collection(db, "feedback"), where("approved", "==", true));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestimonials(data);
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-8 border border-emerald-100">
              <Sparkles size={16} /> Premium EdTech Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Master Generative AI <br />
              <span className="text-emerald-600">With Expert Guidance</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Quiz Support, Lab Walkthroughs, and Challenge Mentorship. We don't just give answers; we build your expertise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#courses" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group">
                Browse Courses <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#pricing" className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all">
                View Pricing
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-[150px]" />
        </div>
      </section>

      {/* Course Catalog */}
      <section id="courses" className="py-24 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore Our Modules</h2>
            <p className="text-slate-600">Structured mentorship for every stage of your AI journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COURSES.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all group shadow-sm hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
                  {course.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">{course.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{course.difficulty}</span>
                  <button 
                    onClick={() => {
                      if (!user) {
                        navigate("/register");
                        return;
                      }
                      addToCart({ id: "quiz", name: "Quiz Support", price: 10 });
                      navigate(`/checkout?course=${encodeURIComponent(course.title)}`);
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1"
                  >
                    Buy Support <ArrowRight size={12} />
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
            <PricingCard title="Quiz Support" price="₹10" features={["Step-by-step logic", "Concept clarification", "Quick turnaround"]} user={user} type="quiz" />
            <PricingCard title="Normal Lab Support" price="₹25" features={["Code walkthroughs", "Debugging assistance", "Environment setup"]} highlighted user={user} type="lab" />
            <PricingCard title="Challenge Lab" price="₹50" features={["Advanced mentorship", "Complex problem solving", "Architectural guidance"]} user={user} type="challenge" />
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
                  onClick={() => {
                    if (!user) { navigate("/register"); return; }
                    addToCart({ id: "quiz_bundle", name: "5 Quiz Supports (Bundle)", price: 40, isBundle: true });
                    navigate("/checkout");
                  }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center min-w-[200px] hover:bg-white/20 transition-all group"
                >
                  <div className="text-emerald-400 font-bold mb-1">5 Quiz Supports</div>
                  <div className="text-3xl font-bold">₹40</div>
                  <div className="text-xs text-slate-400 line-through mt-1">Was ₹50</div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Buy Bundle</div>
                </button>
                <button 
                  onClick={() => {
                    if (!user) { navigate("/register"); return; }
                    addToCart({ id: "lab_bundle", name: "3 Lab Supports (Bundle)", price: 60, isBundle: true });
                    navigate("/checkout");
                  }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center min-w-[200px] hover:bg-white/20 transition-all group"
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

function PricingCard({ title, price, features, highlighted = false, user, type }: any) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleBuy = () => {
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
        onClick={handleBuy}
        className={`w-full block text-center py-3 rounded-xl font-bold transition-all ${highlighted ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
      >
        {user ? "Buy Now" : "Get Started"}
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
