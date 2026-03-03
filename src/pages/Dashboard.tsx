import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { ShoppingBag, Clock, CheckCircle, User, Phone, Mail, ExternalLink, MessageSquare, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch Profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile(data);
          setEditForm({ name: data.name || "", phone: data.phone || "" });
        } else {
          // Fallback if user doc doesn't exist yet
          setProfile({ email: user.email, name: user.displayName || "Student" });
        }

        // Fetch Orders
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setOrders(ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

        // Calculate Stats
        const total = ordersData.length;
        const pending = ordersData.filter(o => o.orderStatus !== "Completed").length;
        const completed = total - pending;
        setStats({ total, pending, completed });
      } catch (error: any) {
        console.warn("Dashboard: Error fetching data (might be offline):", error.message);
        // Set some default state so the UI doesn't look broken
        if (!profile) setProfile({ email: user.email, name: user.displayName || "Student" });
      }
    };

    fetchData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      name: editForm.name,
      phone: editForm.phone,
    });
    setProfile({ ...profile, ...editForm });
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Stats & Profile */}
        <div className="lg:w-1/3 space-y-8">
          {/* Profile Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{profile?.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Student</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <Mail size={20} />
                  </div>
                  <div className="text-sm text-slate-600">{profile?.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <Phone size={20} />
                  </div>
                  <div className="text-sm text-slate-600">{profile?.phone || "No phone added"}</div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            <StatCard icon={<ShoppingBag className="text-blue-500" />} label="Total Orders" value={stats.total} />
            <StatCard icon={<Clock className="text-orange-500" />} label="Pending Support" value={stats.pending} />
            <StatCard icon={<CheckCircle className="text-emerald-500" />} label="Completed" value={stats.completed} />
          </div>

          <Link to="/#courses" className="block w-full bg-slate-900 text-white p-6 rounded-3xl text-center font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <ShoppingCart size={20} /> Buy New Assistance
          </Link>
        </div>

        {/* Right Column: Orders Table */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">My Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-8 py-4">Order ID</th>
                    <th className="px-8 py-4">Course</th>
                    <th className="px-8 py-4">Type</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6 text-sm font-mono text-slate-500">#{order.id.slice(0, 8)}</td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900">{order.courseName}</div>
                        <div className="text-[10px] text-slate-400">{order.createdAt ? format(order.createdAt.toDate(), "MMM dd, yyyy") : ""}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600">{order.assistanceType}</span>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-8 py-6">
                        {order.orderStatus === "Completed" ? (
                          <Link 
                            to={`/feedback/${order.id}`}
                            className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
                          >
                            <MessageSquare size={14} /> Feedback
                          </Link>
                        ) : (
                          <span className="text-slate-300 text-xs font-bold italic">Processing...</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">
                        No assistance requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</div>
      </div>
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
