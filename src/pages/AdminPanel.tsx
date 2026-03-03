import React, { useEffect, useState, useMemo } from "react";
import { collection, query, getDocs, doc, updateDoc, deleteDoc, onSnapshot, orderBy, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Mail, 
  ExternalLink, 
  MessageSquare, 
  Star, 
  ShieldCheck, 
  Filter, 
  Search, 
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  ClipboardList,
  Clock
} from "lucide-react";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "feedback" | "courses">("orders");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    difficulty: "Beginner",
    duration: "4 Weeks",
    price: 10,
    tags: ["quiz"],
    icon: "Terminal"
  });
  
  // Stats State
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalFeedback: 0,
    totalCourses: 0,
    pendingTasks: 0,
    completedTasks: 0
  });

  // Search and Sort State
  const [orderSearch, setOrderSearch] = useState("");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [orderSort, setOrderSort] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [feedbackSort, setFeedbackSort] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    if (!user) return;

    // Real-time Orders
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      
      // Calculate Stats
      let pTasks = 0;
      let cTasks = 0;
      ordersData.forEach((o: any) => {
        o.tasks?.forEach((t: any) => {
          if (t.completed) cTasks++;
          else pTasks++;
        });
      });

      setStats(prev => ({
        ...prev,
        totalOrders: ordersData.length,
        pendingOrders: ordersData.filter((o: any) => o.orderStatus !== "Completed").length,
        completedOrders: ordersData.filter((o: any) => o.orderStatus === "Completed").length,
        pendingTasks: pTasks,
        completedTasks: cTasks
      }));

      setLoading(false);
    });

    // Real-time Feedback
    const qFeedback = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const unsubscribeFeedback = onSnapshot(qFeedback, (snapshot) => {
      const fbData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbacks(fbData);
      setStats(prev => ({ ...prev, totalFeedback: fbData.length }));
    });

    // Real-time Courses
    const qCourses = query(collection(db, "courses"), orderBy("title", "asc"));
    const unsubscribeCourses = onSnapshot(qCourses, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
      setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeFeedback();
      unsubscribeCourses();
    };
  }, [user]);

  const handleToggleTask = async (orderId: string, taskIdx: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newTasks = [...order.tasks];
    newTasks[taskIdx].completed = !newTasks[taskIdx].completed;

    const allCompleted = newTasks.every(t => t.completed);
    const newStatus = allCompleted ? "Completed" : "In Progress";

    await updateDoc(doc(db, "orders", orderId), {
      tasks: newTasks,
      orderStatus: newStatus,
    });

    if (allCompleted && order.orderStatus !== "Completed") {
      fetch("/api/send-completion-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: order.userEmail,
          name: order.userName,
          orderId: orderId,
          courseName: order.courseName,
        }),
      });
    }
  };

  const handleApproveFeedback = async (feedbackId: string, approved: boolean) => {
    await updateDoc(doc(db, "feedback", feedbackId), { approved });
  };

  const seedInitialCourses = async () => {
    const initialCourses = [
      { title: "Prompt Engineering", description: "Master the art of communicating with LLMs for optimal results.", difficulty: "Beginner", price: 10, duration: "4 Weeks", tags: ["quiz", "normal lab"], icon: "Terminal" },
      { title: "LLM Fundamentals", description: "Deep dive into Transformer architectures and model training.", difficulty: "Intermediate", price: 25, duration: "6 Weeks", tags: ["quiz", "normal lab", "challenge lab"], icon: "Brain" },
      { title: "Embeddings & Vector Search", description: "Learn how to store and retrieve semantic information.", difficulty: "Advanced", price: 50, duration: "8 Weeks", tags: ["normal lab", "challenge lab"], icon: "Database" },
      { title: "Gemini / OpenAI API", description: "Integrate powerful AI models into your own applications.", difficulty: "Intermediate", price: 25, duration: "6 Weeks", tags: ["quiz", "normal lab"], icon: "Code" },
      { title: "RAG Systems", description: "Build Retrieval-Augmented Generation pipelines for custom data.", difficulty: "Advanced", price: 50, duration: "8 Weeks", tags: ["challenge lab"], icon: "Search" },
      { title: "Responsible AI", description: "Ethics, bias mitigation, and safety in AI development.", difficulty: "Beginner", price: 10, duration: "4 Weeks", tags: ["quiz"], icon: "ShieldCheck" },
    ];

    for (const course of initialCourses) {
      await addDoc(collection(db, "courses"), course);
    }
    alert("Initial courses seeded successfully!");
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (window.confirm("Delete this feedback?")) {
      await deleteDoc(doc(db, "feedback", feedbackId));
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateDoc(doc(db, "courses", editingCourse.id), courseForm);
      } else {
        await addDoc(collection(db, "courses"), courseForm);
      }
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      setCourseForm({
        title: "",
        description: "",
        difficulty: "Beginner",
        duration: "4 Weeks",
        price: 10,
        tags: ["quiz"],
        icon: "Terminal"
      });
    } catch (err) {
      console.error("Error saving course:", err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Delete this course?")) {
      await deleteDoc(doc(db, "courses", courseId));
    }
  };

  const openEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      duration: course.duration,
      price: course.price,
      tags: course.tags || ["quiz"],
      icon: course.icon || "Terminal"
    });
    setIsCourseModalOpen(true);
  };

  const requestSort = (tab: "orders" | "feedback", key: string) => {
    const setSort = tab === "orders" ? setOrderSort : setFeedbackSort;
    const currentSort = tab === "orders" ? orderSort : feedbackSort;
    
    let direction: 'asc' | 'desc' = 'desc';
    if (currentSort.key === key && currentSort.direction === 'desc') {
      direction = 'asc';
    }
    setSort({ key, direction });
  };

  const getSortIcon = (tab: "orders" | "feedback", key: string) => {
    const currentSort = tab === "orders" ? orderSort : feedbackSort;
    if (currentSort.key !== key) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
    return currentSort.direction === 'asc' ? <ChevronUp size={12} className="ml-1 text-emerald-500" /> : <ChevronDown size={12} className="ml-1 text-emerald-500" />;
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    // Filter
    if (orderSearch) {
      const search = orderSearch.toLowerCase();
      result = result.filter(o => 
        o.courseName?.toLowerCase().includes(search) ||
        o.userName?.toLowerCase().includes(search) ||
        o.userEmail?.toLowerCase().includes(search) ||
        o.id?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[orderSort.key];
      let bVal = b[orderSort.key];

      // Handle nested or special fields
      if (orderSort.key === 'createdAt') {
        aVal = a.createdAt?.toMillis() || 0;
        bVal = b.createdAt?.toMillis() || 0;
      }

      if (aVal < bVal) return orderSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return orderSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, orderSearch, orderSort]);

  const filteredFeedbacks = useMemo(() => {
    let result = [...feedbacks];

    // Filter
    if (feedbackSearch) {
      const search = feedbackSearch.toLowerCase();
      result = result.filter(f => 
        f.userName?.toLowerCase().includes(search) ||
        f.courseName?.toLowerCase().includes(search) ||
        f.review?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[feedbackSort.key];
      let bVal = b[feedbackSort.key];

      if (feedbackSort.key === 'createdAt') {
        aVal = a.createdAt?.toMillis() || 0;
        bVal = b.createdAt?.toMillis() || 0;
      }

      if (aVal < bVal) return feedbackSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return feedbackSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [feedbacks, feedbackSearch, feedbackSort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Admin Command Center</h1>
          <p className="text-slate-500 font-medium">Manage assistance requests and student feedback with precision.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "orders" ? "bg-white text-slate-900 shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700"}`}
          >
            <ShoppingBag size={18} />
            Orders
          </button>
          <button 
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "feedback" ? "bg-white text-slate-900 shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700"}`}
          >
            <MessageSquare size={18} />
            Feedback
          </button>
          <button 
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "courses" ? "bg-white text-slate-900 shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700"}`}
          >
            <ClipboardList size={18} />
            Courses
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        <AdminStatCard 
          label="Total Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingBag className="text-blue-600" size={24} />} 
          color="blue"
        />
        <AdminStatCard 
          label="Pending Support" 
          value={stats.pendingOrders} 
          icon={<Clock className="text-orange-600" size={24} />} 
          color="orange"
        />
        <AdminStatCard 
          label="Active Courses" 
          value={stats.totalCourses} 
          icon={<ClipboardList className="text-emerald-600" size={24} />} 
          color="emerald"
        />
        <AdminStatCard 
          label="Pending Tasks" 
          value={stats.pendingTasks} 
          icon={<ClipboardList className="text-purple-600" size={24} />} 
          color="purple"
        />
        <AdminStatCard 
          label="Completed Tasks" 
          value={stats.completedTasks} 
          icon={<CheckSquare className="text-emerald-600" size={24} />} 
          color="emerald"
        />
      </div>

      {activeTab === "orders" ? (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Active Requests</h2>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full sm:w-64 pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all bg-white" 
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">
                    <th className="px-8 py-5 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => requestSort("orders", "courseName")}>
                      <div className="flex items-center">Order Details {getSortIcon("orders", "courseName")}</div>
                    </th>
                    <th className="px-8 py-5 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => requestSort("orders", "userName")}>
                      <div className="flex items-center">Student {getSortIcon("orders", "userName")}</div>
                    </th>
                    <th className="px-8 py-5 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => requestSort("orders", "amount")}>
                      <div className="flex items-center">Assistance {getSortIcon("orders", "amount")}</div>
                    </th>
                    <th className="px-8 py-5 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => requestSort("orders", "orderStatus")}>
                      <div className="flex items-center">Status {getSortIcon("orders", "orderStatus")}</div>
                    </th>
                    <th className="px-8 py-5">Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-8 py-8">
                        <div className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{order.courseName}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{order.id.slice(0, 8)}</span>
                          <span className="text-[10px] font-bold text-slate-400">{order.createdAt ? format(order.createdAt.toDate(), "MMM dd, HH:mm") : ""}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-sm font-bold text-slate-900">{order.userName}</div>
                        <div className="text-xs text-slate-500 font-medium">{order.userEmail}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-bold">{order.phone}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-xs font-bold text-slate-600 mb-1">{order.assistanceType}</div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black">₹{order.amount}</div>
                      </td>
                      <td className="px-8 py-8">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-wrap gap-2 max-w-xs">
                          {order.tasks?.map((task: any, idx: number) => (
                            <button 
                              key={idx}
                              onClick={() => handleToggleTask(order.id, idx)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                                task.completed 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-500"
                              }`}
                            >
                              {task.completed ? <CheckSquare size={12} /> : <Square size={12} />}
                              <span className={task.completed ? "line-through opacity-60" : ""}>{task.label}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <Search size={48} className="mb-4" />
                          <p className="text-lg font-bold">No orders found matching your search</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "feedback" ? (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-purple-600" size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Student Feedback</h2>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search feedback..." 
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    className="w-full sm:w-64 pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/5 transition-all bg-white" 
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">
                    <th className="px-8 py-5 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => requestSort("feedback", "userName")}>
                      <div className="flex items-center">Student {getSortIcon("feedback", "userName")}</div>
                    </th>
                    <th className="px-8 py-5 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => requestSort("feedback", "rating")}>
                      <div className="flex items-center">Rating {getSortIcon("feedback", "rating")}</div>
                    </th>
                    <th className="px-8 py-5">Review</th>
                    <th className="px-8 py-5 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => requestSort("feedback", "approved")}>
                      <div className="flex items-center">Status {getSortIcon("feedback", "approved")}</div>
                    </th>
                    <th className="px-8 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFeedbacks.map((fb) => (
                    <tr key={fb.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-8 py-8">
                        <div className="text-sm font-black text-slate-900 mb-1">{fb.userName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{fb.courseName}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < fb.rating ? "#8b5cf6" : "none"} className={i < fb.rating ? "text-purple-500" : "text-slate-200"} />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-8 max-w-md">
                        <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 group-hover:line-clamp-none transition-all duration-500">{fb.review}</p>
                      </td>
                      <td className="px-8 py-8">
                        <button 
                          onClick={() => handleApproveFeedback(fb.id, !fb.approved)}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border transition-all duration-300 ${
                            fb.approved 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" 
                            : "bg-slate-50 text-slate-400 border-slate-100"
                          }`}
                        >
                          {fb.approved ? "Approved" : "Pending"}
                        </button>
                      </td>
                      <td className="px-8 py-8">
                        <button 
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredFeedbacks.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <MessageSquare size={48} className="mb-4" />
                          <p className="text-lg font-bold">No feedback found matching your search</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <ClipboardList className="text-emerald-600" size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Course Management</h2>
              </div>
              <div className="flex gap-4">
                {courses.length === 0 && (
                  <button 
                    onClick={seedInitialCourses}
                    className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                  >
                    Seed Initial Courses
                  </button>
                )}
                <button 
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseForm({
                      title: "",
                      description: "",
                      difficulty: "Beginner",
                      duration: "4 Weeks",
                      price: 10,
                      tags: ["quiz"],
                      icon: "Terminal"
                    });
                    setIsCourseModalOpen(true);
                  }}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-100"
                >
                  Add New Course
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">
                    <th className="px-8 py-5">Course Info</th>
                    <th className="px-8 py-5">Tags & Duration</th>
                    <th className="px-8 py-5">Price</th>
                    <th className="px-8 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <tr key={course.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-8 py-8">
                        <div className="text-sm font-black text-slate-900 mb-1">{course.title}</div>
                        <div className="text-xs text-slate-500 font-medium line-clamp-1 max-w-xs">{course.description}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {course.tags?.map((tag: string) => (
                            <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {course.duration} • {course.difficulty}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-sm font-black text-emerald-600">₹{course.price}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditCourse(course)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <ClipboardList size={48} className="mb-4" />
                          <p className="text-lg font-bold">No courses added yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Course Title</label>
                  <input 
                    type="text" 
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                    placeholder="e.g. Prompt Engineering Mastery"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Description</label>
                  <textarea 
                    required
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-medium h-24 resize-none"
                    placeholder="Briefly describe the course content..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Difficulty</label>
                  <select 
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({...courseForm, difficulty: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Duration</label>
                  <input 
                    type="text" 
                    required
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                    placeholder="e.g. 4 Weeks"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Base Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({...courseForm, price: parseInt(e.target.value)})}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Icon (Lucide Name)</label>
                  <input 
                    type="text" 
                    value={courseForm.icon}
                    onChange={(e) => setCourseForm({...courseForm, icon: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                    placeholder="e.g. Terminal, Code, Brain"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={courseForm.tags.join(", ")}
                    onChange={(e) => setCourseForm({...courseForm, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t !== "")})}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                    placeholder="quiz, normal lab, challenge lab"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200"
                >
                  {editingCourse ? "Update Course" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    "Pending": {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
      icon: <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse mr-1.5" />
    },
    "In Progress": {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      icon: <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
    },
    "Completed": {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      icon: <CheckSquare size={10} className="mr-1.5" />
    },
  };
  
  const config = configs[status] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" };
  
  return (
    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
      {config.icon}
      {status}
    </span>
  );
}

function AdminStatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 border-blue-100",
    orange: "bg-orange-50 border-orange-100",
    purple: "bg-purple-50 border-purple-100",
    emerald: "bg-emerald-50 border-emerald-100",
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} shadow-sm transition-all hover:shadow-md group`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-3xl font-black text-slate-900">{value}</div>
      </div>
      <div className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  );
}
