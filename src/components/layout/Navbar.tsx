import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { SEED_USERS } from '../../../server/services/db.js';
import { 
  Users, 
  Sparkles, 
  Briefcase, 
  Trophy, 
  MessageSquare, 
  User, 
  ShieldAlert, 
  Bell, 
  ChevronDown, 
  Layers, 
  UserCheck, 
  Compass, 
  LogOut,
  ExternalLink,
  Code2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    unreadNotificationCount, 
    notifications, 
    switchUser,
    addToast,
    adminSession,
    openAdminPortal,
    firebaseUser,
    loginWithGoogle,
    logoutWithGoogle,
    isGoogleSigningIn,
    isGeminiChatOpen,
    setIsGeminiChatOpen
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">SkillSync</span>
                  <span className="text-[10px] font-semibold tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">PRO</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Different Skills. Same Goals.</p>
              </div>
            </button>

            {/* Quick Mode Indicator */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Mode: <strong className="text-slate-800 capitalize">{currentUser.mode === 'solo' ? 'Solo Candidate' : 'Team Lead'}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 capitalize">{currentUser.availability.replace(/_/g, ' ')}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'home' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('discover')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'discover' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'teams' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teams</span>
            </button>

            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'opportunities' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Opportunities</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 relative ${
                activeTab === 'messages' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'profile' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>
          </nav>

          {/* Right Area: Notifications, Staff Access, & User Profile Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Gemini AI Advisor Button */}
            <button
              onClick={() => setIsGeminiChatOpen(!isGeminiChatOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 text-purple-700 border border-purple-200 transition-all shadow-sm group"
              title="Open Gemini AI Collaboration & Matchmaking Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Google Sign-In with Firebase Auth */}
            {!firebaseUser ? (
              <button
                onClick={loginWithGoogle}
                disabled={isGoogleSigningIn}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition-all"
                title="Sign in with your Google account via Firebase Auth"
              >
                {isGoogleSigningIn ? (
                  <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span className="hidden sm:inline">Google Sign-in</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[11px] text-emerald-800 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[100px] truncate">{firebaseUser.displayName || 'Google User'}</span>
              </div>
            )}

            {/* If Admin session active, show Staff Portal shortcut */}
            {adminSession && (
              <button
                onClick={openAdminPortal}
                className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-black text-white px-2.5 py-1.5 rounded-lg font-semibold shadow-sm transition-all"
                title="Open Admin Control Center"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Console</span>
              </button>
            )}
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800">Notifications</span>
                    <span className="text-xs text-slate-500">{notifications.length} total</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">No notifications right now</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 text-left transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 pt-2 border-t border-slate-100 text-center">
                    <button 
                      onClick={() => {
                        setShowNotifDropdown(false);
                        addToast('All notifications marked as read');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium py-1"
                    >
                      Dismiss Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Switcher / Profile Button */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="hidden sm:block text-left text-xs pr-1">
                    <div className="font-semibold text-slate-900 leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[110px]">{currentUser.headline}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Profile & Persona Switcher Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Profile Completeness: {currentUser.completenessScore}%</span>
                      </div>
                    </div>

                    <div className="px-2 py-1.5">
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        Switch Demo Persona
                      </div>
                      {SEED_USERS.slice(0, 5).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                            currentUser.id === u.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                          <div className="truncate">
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{u.skills[0]?.name} · {u.skills[1]?.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 px-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setActiveTab('profile');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Manage Profile & Settings</span>
                      </button>

                      {firebaseUser ? (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            logoutWithGoogle();
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span className="truncate">Sign out of Google ({firebaseUser.displayName || firebaseUser.email})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            loginWithGoogle();
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 font-medium"
                        >
                          <UserCheck className="w-4 h-4 text-blue-500" />
                          <span>Link & Sign in with Google</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          openAdminPortal();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-purple-700 hover:bg-purple-50 rounded-lg flex items-center gap-2 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-600" />
                        <span>Staff Admin Console</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between border-t border-slate-100 py-2 text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-1 text-center font-medium ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-1 text-center font-medium ${activeTab === 'discover' ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-1 text-center font-medium ${activeTab === 'teams' ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`flex-1 py-1 text-center font-medium ${activeTab === 'opportunities' ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-1 text-center font-medium ${activeTab === 'messages' ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1 text-center font-medium ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-600'}`}
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};
