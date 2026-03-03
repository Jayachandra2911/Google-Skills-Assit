import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
              <span className="text-xl font-bold tracking-tight text-white">GenAI Assist Pro</span>
            </div>
            <p className="text-sm leading-relaxed">
              Premium mentorship and guided assistance for Generative AI students. We empower you to master the future of AI.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Disclaimer</h4>
            <p className="text-xs leading-relaxed">
              "We provide mentorship and guidance. Students complete their own assessments. We do not complete assessments for students."
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs">
          © {new Date().getFullYear()} GenAI Assist Pro. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
