import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, NotificationItem, Conversation, Team, AdminSession } from '../types/index.js';
import { api } from '../services/apiClient.js';
import {
  auth,
  signInWithGoogle,
  signOutFromFirebase,
  syncUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  testFirestoreConnection,
} from '../services/firebase.js';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string | null) => void;
  selectedOpportunityId: string | null;
  setSelectedOpportunityId: (id: string | null) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshUserData: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  openReportModal: (params: { targetType: 'user' | 'team' | 'message'; targetId: string; targetName: string }) => void;
  reportModalParams: { targetType: 'user' | 'team' | 'message'; targetId: string; targetName: string } | null;
  closeReportModal: () => void;

  // Firebase Authentication & Persistence
  firebaseUser: FirebaseUser | null;
  loginWithGoogle: () => Promise<void>;
  logoutWithGoogle: () => Promise<void>;
  isGoogleSigningIn: boolean;

  // Gemini AI Chatbot Modal Trigger
  isGeminiChatOpen: boolean;
  setIsGeminiChatOpen: (open: boolean) => void;

  // Dedicated Admin Portal & Authentication
  adminSession: AdminSession | null;
  isAdminPortalOpen: boolean;
  openAdminPortal: () => void;
  closeAdminPortal: () => void;
  showAdminAuthModal: boolean;
  setShowAdminAuthModal: (open: boolean) => void;
  loginAdmin: (data: { email?: string; adminSecretKey?: string }) => Promise<void>;
  signupAdmin: (data: { name: string; email: string; adminSecretKey: string; headline?: string }) => Promise<void>;
  logoutAdmin: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reportModalParams, setReportModalParams] = useState<{ targetType: 'user' | 'team' | 'message'; targetId: string; targetName: string } | null>(null);

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Gemini Chat State
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);

  // Admin Portal State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skillsync_admin_session');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshUserData = async () => {
    try {
      const { user } = await api.getCurrentUser();
      setCurrentUser(user);

      const notifData = await api.getNotifications();
      setNotifications(notifData.notifications || []);

      const convData = await api.getConversations();
      setConversations(convData.conversations || []);
    } catch (err) {
      console.error('[AppContext] Failed to refresh user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In with Firebase Auth & Firestore Persistence
  const loginWithGoogle = async () => {
    setIsGoogleSigningIn(true);
    try {
      const { firebaseUser: fbUser } = await signInWithGoogle();
      setFirebaseUser(fbUser);

      // Check Firestore for existing user profile
      let profile = await fetchUserProfileFromFirestore(fbUser.uid);

      if (!profile) {
        // Construct new collaborator profile from Google details
        profile = {
          id: fbUser.uid,
          email: fbUser.email || 'user@example.com',
          username: (fbUser.displayName || 'user').toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
          name: fbUser.displayName || 'Google Collaborator',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          headline: 'Full-Stack Developer & Innovator',
          bio: 'Passionate about building scalable web solutions and teaming up for high-impact hackathons.',
          location: 'San Francisco, CA (Remote Friendly)',
          role: 'candidate',
          mode: 'solo',
          availability: 'available_now',
          commitmentHoursPerWeek: 20,
          goals: ['hackathons', 'startups', 'open_source'],
          skills: [
            { id: `sk-fb-1`, name: 'TypeScript', category: 'Programming', proficiency: 'advanced', yearsOfExperience: 3, verified: true },
            { id: `sk-fb-2`, name: 'React', category: 'Frontend', proficiency: 'advanced', yearsOfExperience: 3, verified: true },
            { id: `sk-fb-3`, name: 'Node.js', category: 'Backend', proficiency: 'intermediate', yearsOfExperience: 2, verified: true },
          ],
          lookingForSkills: ['Python', 'AI/ML', 'UI/UX Design', 'PyTorch'],
          education: [],
          experience: [],
          projects: [],
          github: { connected: false, username: '', topLanguages: [], featuredRepos: [] },
          leetcode: { connected: false },
          privacy: {
            profileVisibility: 'public',
            resumeVisibility: true,
            githubVisibility: true,
            leetcodeVisibility: true,
            timelineVisibility: true,
            onlineStatusVisibility: true,
            allowDirectMessagesFrom: 'anyone',
          },
          preferences: {
            emailNotifications: true,
            matchAlerts: true,
            teamInvites: true,
            opportunityDeadlines: true,
            preferredCommitmentHoursPerWeek: 20,
          },
          completenessScore: 85,
          teamsJoinedCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to Firestore
        await syncUserProfileToFirestore(profile);
      }

      // Also register or sync with backend API session
      try {
        await api.register({
          name: profile.name,
          email: profile.email,
          headline: profile.headline,
          mode: profile.mode,
          lookingForSkills: profile.lookingForSkills,
        });
      } catch {
        // User may already exist in memory API
      }

      setCurrentUser(profile);
      addToast(`Signed in with Google as ${profile.name}! User state synced to Firestore.`, 'success');
      await refreshUserData();
    } catch (err: any) {
      console.error('[Google Sign-In Error]', err);
      addToast(err.message || 'Google Sign-in failed', 'error');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const logoutWithGoogle = async () => {
    try {
      await signOutFromFirebase();
      setFirebaseUser(null);
      // Switch back to demo default user
      await api.switchUser('usr-2');
      await refreshUserData();
      addToast('Signed out of Google account', 'info');
    } catch (err: any) {
      addToast(err.message || 'Sign out failed', 'error');
    }
  };

  const switchUser = async (userId: string) => {
    try {
      setLoading(true);
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);

      // Also sync user profile to Firestore
      await syncUserProfileToFirestore(res.user);

      addToast(`Switched active profile to ${res.user.name}`, 'info');
      await refreshUserData();
    } catch (err: any) {
      addToast(err.message || 'Failed to switch user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openReportModal = (params: { targetType: 'user' | 'team' | 'message'; targetId: string; targetName: string }) => {
    setReportModalParams(params);
  };

  const closeReportModal = () => {
    setReportModalParams(null);
  };

  // Admin Portal Actions
  const openAdminPortal = () => {
    if (adminSession) {
      setIsAdminPortalOpen(true);
    } else {
      setShowAdminAuthModal(true);
    }
  };

  const closeAdminPortal = () => {
    setIsAdminPortalOpen(false);
  };

  const loginAdmin = async (data: { email?: string; adminSecretKey?: string }) => {
    try {
      const res = await api.adminLogin(data);
      setAdminSession(res.adminSession);
      localStorage.setItem('skillsync_admin_session', JSON.stringify(res.adminSession));
      setShowAdminAuthModal(false);
      setIsAdminPortalOpen(true);
      addToast(`Welcome back, Administrator ${res.adminSession.name}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Admin authentication failed', 'error');
      throw err;
    }
  };

  const signupAdmin = async (data: { name: string; email: string; adminSecretKey: string; headline?: string }) => {
    try {
      const res = await api.adminSignup(data);
      setAdminSession(res.adminSession);
      localStorage.setItem('skillsync_admin_session', JSON.stringify(res.adminSession));
      setShowAdminAuthModal(false);
      setIsAdminPortalOpen(true);
      addToast(`Admin account established for ${res.adminSession.name}!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Admin signup failed', 'error');
      throw err;
    }
  };

  const logoutAdmin = () => {
    setAdminSession(null);
    localStorage.removeItem('skillsync_admin_session');
    setIsAdminPortalOpen(false);
    addToast('Admin console session closed', 'info');
  };

  useEffect(() => {
    // Test Firestore connection on boot
    testFirestoreConnection();

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const firestoreProfile = await fetchUserProfileFromFirestore(fbUser.uid);
        if (firestoreProfile) {
          setCurrentUser(firestoreProfile);
        }
      }
    });

    refreshUserData();

    // Polling for live notifications & chat updates
    const interval = setInterval(() => {
      api.getNotifications().then((res) => {
        if (res.notifications) setNotifications(res.notifications);
      }).catch(() => {});

      api.getConversations().then((res) => {
        if (res.conversations) setConversations(res.conversations);
      }).catch(() => {});
    }, 10000);

    return () => {
      unsubscribeAuth();
      clearInterval(interval);
    };
  }, []);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        loading,
        activeTab,
        setActiveTab,
        notifications,
        unreadNotificationCount,
        conversations,
        activeConversationId,
        setActiveConversationId,
        selectedUserId,
        setSelectedUserId,
        selectedTeamId,
        setSelectedTeamId,
        selectedOpportunityId,
        setSelectedOpportunityId,
        toasts,
        addToast,
        removeToast,
        refreshUserData,
        switchUser,
        openReportModal,
        reportModalParams,
        closeReportModal,
        firebaseUser,
        loginWithGoogle,
        logoutWithGoogle,
        isGoogleSigningIn,
        isGeminiChatOpen,
        setIsGeminiChatOpen,
        adminSession,
        isAdminPortalOpen,
        openAdminPortal,
        closeAdminPortal,
        showAdminAuthModal,
        setShowAdminAuthModal,
        loginAdmin,
        signupAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

