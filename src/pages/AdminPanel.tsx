import React, { useEffect, useState } from "react";
import { collection, query, getDocs, doc, updateDoc, deleteDoc, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import { CheckSquare, Square, Trash2, Mail, ExternalLink, MessageSquare, Star, ShieldCheck, Filter, Search } from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "feedback">("orders");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Real-time Orders
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Real-time Feedback
    const qFeedback = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const unsubscribeFeedback = onSnapshot(qFeedback, (snapshot) => {
      setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeFeedback();
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
      // Trigger Completion Email via API
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

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (window.confirm("Delete this feedback?")) {
      await deleteDoc(doc(db, "feedback", feedbackId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Command Center</h1>
          <p className="text-slate-500">Manage assistance requests and student feedback.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "orders" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab("feedback")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "feedback" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            Feedback
          </button>
        </div>
      </div>

      {activeTab === "orders" ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Active Requests</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search orders..." className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500" />
              </div>
              <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900"><Filter size={20} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Order Details</th>
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Assistance Type</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-slate-900">{order.courseName}</div>
                      <div className="text-xs font-mono text-slate-400">#{order.id.slice(0, 8)}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{order.createdAt ? format(order.createdAt.toDate(), "MMM dd, HH:mm") : ""}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-slate-900">{order.userName}</div>
                      <div className="text-xs text-slate-500">{order.userEmail}</div>
                      <div className="text-xs text-slate-500">{order.phone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-medium text-slate-600">{order.assistanceType}</div>
                      <div className="text-xs font-bold text-emerald-600 mt-1">₹{order.amount}</div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        {order.tasks?.map((task: any, idx: number) => (
                          <button 
                            key={idx}
                            onClick={() => handleToggleTask(order.id, idx)}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors"
                          >
                            {task.completed ? <CheckSquare size={14} className="text-emerald-500" /> : <Square size={14} />}
                            <span className={task.completed ? "line-through opacity-50" : ""}>{task.label}</span>
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Student Feedback</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Rating</th>
                  <th className="px-8 py-4">Review</th>
                  <th className="px-8 py-4">Approved</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-slate-900">{fb.userName}</div>
                      <div className="text-xs text-slate-500">{fb.courseName}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < fb.rating ? "#10b981" : "none"} className={i < fb.rating ? "text-emerald-500" : "text-slate-200"} />
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-xs text-slate-600 leading-relaxed truncate hover:whitespace-normal">{fb.review}</p>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleApproveFeedback(fb.id, !fb.approved)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${fb.approved ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                      >
                        {fb.approved ? "Approved" : "Pending"}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    "Pending": "bg-orange-50 text-orange-600 border-orange-100",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
    "Completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${colors[status] || "bg-slate-50 text-slate-600"}`}>
      {status}
    </span>
  );
}
