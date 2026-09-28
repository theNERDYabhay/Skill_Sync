import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { HomeDashboard } from './components/home/HomeDashboard.js';
import { DiscoveryView } from './components/discovery/DiscoveryView.js';
import { TeamsView } from './components/teams/TeamsView.js';
import { OpportunitiesView } from './components/opportunities/OpportunitiesView.js';
import { ChatView } from './components/chat/ChatView.js';
import { ProfileView } from './components/profile/ProfileView.js';
import { AdminPortal } from './components/admin/AdminPortal.js';
import { AdminAuthModal } from './components/admin/AdminAuthModal.js';
import { ReportModal } from './components/common/ReportModal.js';
import { GeminiChatbot } from './components/gemini/GeminiChatbot.js';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, toasts, removeToast, isAdminPortalOpen, openAdminPortal, adminSession } = useApp();

  // If Admin Portal mode is active, render the dedicated, isolated Admin Console
  if (isAdminPortalOpen) {
    return (
      <>
        <AdminPortal />
        {/* Actionable Toasts in Admin Console */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto p-3.5 rounded-xl shadow-lg border flex items-center justify-between gap-3 text-xs font-medium bg-slate-950 text-white border-slate-700 animate-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-purple-400 shrink-0" />}
                <span>{toast.message}</span>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Standard User Collaboration Experience (Admin tab is completely removed from user navigation)
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top Navbar for Collaborators */}
      <Navbar />

      {/* Main User Tab Routing */}
      <main className="flex-1">
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'discover' && <DiscoveryView />}
        {activeTab === 'teams' && <TeamsView />}
        {activeTab === 'opportunities' && <OpportunitiesView />}
        {activeTab === 'messages' && <ChatView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Footer with Discreet Staff Portal Link */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SkillSync</span>
            <span>·</span>
            <span>Different Skills. Same Goals.</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span>AI Recommendation Engine v2.4.1</span>
            <span>·</span>
            <span>PostgreSQL & Redis Cache</span>
            <span>·</span>
            <button
              onClick={openAdminPortal}
              className="text-slate-400 hover:text-purple-600 transition-colors flex items-center gap-1 font-medium"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>{adminSession ? 'Staff Admin Console (Active)' : 'Staff Admin Access'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Portals */}
      <ReportModal />
      <AdminAuthModal />

      {/* Actionable Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border flex items-center justify-between gap-3 text-xs font-medium animate-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-50 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-50 border-rose-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
