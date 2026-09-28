import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { AdminStats, ModerationReport, UserProfile, Team, Opportunity } from '../../types/index.js';
import { 
  ShieldAlert, 
  Sliders, 
  Users, 
  Trophy, 
  Layers, 
  Activity, 
  LogOut, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Save, 
  Check, 
  RefreshCw, 
  Shield, 
  Lock,
  UserCheck,
  X,
  History,
  Terminal
} from 'lucide-react';
import { AuditLogView } from './AuditLogView.js';

export const AdminPortal: React.FC = () => {
  const { adminSession, closeAdminPortal, logoutAdmin, addToast } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'metrics' | 'users' | 'teams' | 'opportunities' | 'weights' | 'reports' | 'audit'>('metrics');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allOpps, setAllOpps] = useState<Opportunity[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [auditCount, setAuditCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [userSearch, setUserSearch] = useState('');

  // Special User Editing Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserHeadline, setEditUserHeadline] = useState('');
  const [editUserBio, setEditUserBio] = useState('');
  const [editUserLocation, setEditUserLocation] = useState('');
  const [editUserRole, setEditUserRole] = useState<'candidate' | 'team_lead' | 'admin'>('candidate');
  const [editUserVerifiedBadge, setEditUserVerifiedBadge] = useState(false);
  const [editUserSuspended, setEditUserSuspended] = useState(false);

  // Special Team Editing Modal State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamTagline, setEditTeamTagline] = useState('');
  const [editTeamMission, setEditTeamMission] = useState('');
  const [editTeamStack, setEditTeamStack] = useState('');

  // Create Opportunity Modal State
  const [showCreateOppModal, setShowCreateOppModal] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppOrganizer, setOppOrganizer] = useState('');
  const [oppType, setOppType] = useState<'hackathon' | 'contest' | 'startup' | 'open_source'>('hackathon');
  const [oppHeadline, setOppHeadline] = useState('');
  const [oppDescription, setOppDescription] = useState('');
  const [oppPrizePool, setOppPrizePool] = useState('$50,000 USD');
  const [oppDeadline, setOppDeadline] = useState('2026-11-30T23:59:59Z');
  const [oppSkills, setOppSkills] = useState('React, TypeScript, Python, PyTorch');

  // Weights Local State
  const [weights, setWeights] = useState({
    skillComplementarity: 0.30,
    semanticSimilarity: 0.20,
    goalCompatibility: 0.15,
    projectRelevance: 0.15,
    experienceRelevance: 0.10,
    availabilityFit: 0.10,
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, teamsRes, oppsRes, reportsRes, auditRes] = await Promise.all([
        api.getAdminStats(),
        api.getUsers(),
        api.getTeams(),
        api.getOpportunities(),
        api.getAdminReports(),
        api.getAdminAuditLogs({ limit: 1 }).catch(() => ({ logs: [], totalCount: 0 })),
      ]);

      setStats(statsRes.stats);
      setAllUsers(usersRes.users || []);
      setAllTeams(teamsRes.teams || []);
      setAllOpps(oppsRes.opportunities || []);
      setReports(reportsRes.reports || []);
      setAuditCount(auditRes.totalCount || 0);

      if (statsRes.stats?.recommendationWeights) {
        setWeights({
          skillComplementarity: statsRes.stats.recommendationWeights.skillComplementarity,
          semanticSimilarity: statsRes.stats.recommendationWeights.semanticSimilarity,
          goalCompatibility: statsRes.stats.recommendationWeights.goalCompatibility,
          projectRelevance: statsRes.stats.recommendationWeights.projectRelevance,
          experienceRelevance: statsRes.stats.recommendationWeights.experienceRelevance,
          availabilityFit: statsRes.stats.recommendationWeights.availabilityFit,
        });
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- User Editing Operations ---
  const openEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserHeadline(user.headline);
    setEditUserBio(user.bio);
    setEditUserLocation(user.location);
    setEditUserRole(user.role);
    setEditUserVerifiedBadge(!!user.verifiedBadge);
    setEditUserSuspended(!!user.isSuspended);
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.adminUpdateUser(editingUser.id, {
        name: editUserName,
        headline: editUserHeadline,
        bio: editUserBio,
        location: editUserLocation,
        role: editUserRole,
        verifiedBadge: editUserVerifiedBadge,
        isSuspended: editUserSuspended,
      });
      addToast(`Updated user ${editUserName} successfully!`, 'success');
      setEditingUser(null);
      await loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${userName}"?`)) return;
    try {
      await api.adminDeleteUser(userId);
      addToast(`User ${userName} deleted.`, 'info');
      await loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // --- Team Editing Operations ---
  const openEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamTagline(team.tagline);
    setEditTeamMission(team.mission);
    setEditTeamStack(team.techStack.join(', '));
  };

  const handleSaveTeamEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    try {
      await api.adminUpdateTeam(editingTeam.id, {
        name: editTeamName,
        tagline: editTeamTagline,
        mission: editTeamMission,
        techStack: editTeamStack.split(',').map((s) => s.trim()),
      });
      addToast(`Updated squad "${editTeamName}"`, 'success');
      setEditingTeam(null);
      await loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update team', 'error');
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Delete squad "${teamName}"? This cannot be undone.`)) return;
    try {
      await api.adminDeleteTeam(teamId);
      addToast(`Team ${teamName} deleted`, 'info');
      await loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete team', 'error');
    }
  };

  // --- Opportunity Operations ---
  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateOpportunity({
        title: oppTitle.trim(),
        organizer: oppOrganizer.trim(),
        type: oppType,
        headline: oppHeadline.trim(),
        description: oppDescription.trim(),
        prizePool: oppPrizePool.trim(),
        deadline: oppDeadline,
        requiredSkills: oppSkills.split(',').map((s) => s.trim()),
      });
      addToast(`Published opportunity "${oppTitle}"!`, 'success');
      setShowCreateOppModal(false);
      setOppTitle('');
      setOppOrganizer('');
      setOppHeadline('');
      setOppDescription('');
      await loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to create opportunity', 'error');
    }
  };

  const handleDeleteOpportunity = async (oppId: string, title: string) => {
    if (!window.confirm(`Delete opportunity "${title}"?`)) return;
    try {
      await api.adminDeleteOpportunity(oppId);
      addToast(`Opportunity removed`, 'info');
      await loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete opportunity', 'error');
    }
  };

  // --- Recommendation Weights ---
  const handleSaveWeights = async () => {
    try {
      await api.updateAdminWeights(weights);
      addToast('Recommendation engine weights calibrated & deployed across live pipelines!', 'success');
      await loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update weights', 'error');
    }
  };

  // --- Moderation ---
  const handleResolveReport = async (reportId: string, action: string) => {
    try {
      await api.resolveAdminReport(reportId, action);
      addToast(`Report resolved with action: ${action}`, 'success');
      await loadAllAdminData();
    } catch (err: any) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.headline.toLowerCase().includes(q);
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Control Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">SkillSync Admin Console</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded">
                  Staff Access
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as: <strong className="text-slate-200">{adminSession?.name || 'Administrator'}</strong> ({adminSession?.email || 'admin@skillsync.io'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeAdminPortal}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to User App</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-3.5 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-rose-800/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveAdminTab('metrics')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'metrics' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview & Health</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Management & Editing ({allUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('teams')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'teams' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Squads & Teams ({allTeams.length})</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('opportunities')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'opportunities' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Opportunities ({allOpps.length})</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('weights')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'weights' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Matching Calibrator</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'reports' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safety Reports ({reports.filter((r) => r.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'audit' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Log & Trail ({auditCount})</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
            <span>Loading admin management subsystems...</span>
          </div>
        ) : activeAdminTab === 'metrics' ? (
          /* TAB 1: OVERVIEW METRICS */
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</div>
                <div className="text-3xl font-extrabold text-white mt-1">{stats?.totalUsers || 0}</div>
                <div className="text-[11px] text-emerald-400 font-medium mt-1">+{stats?.activeUsers} active this week</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Squads</div>
                <div className="text-3xl font-extrabold text-blue-400 mt-1">{stats?.totalTeams || 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">{stats?.teamFormationsCount} formed pods</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Matches</div>
                <div className="text-3xl font-extrabold text-purple-400 mt-1">{stats?.totalMatchesGenerated || 0}</div>
                <div className="text-[11px] text-purple-300 mt-1">{stats?.successfulConnections} mutual matches</div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">P99 ML Engine Latency</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">{stats?.systemHealth.mlEngineLatencyMs}ms</div>
                <div className="text-[11px] text-slate-400 mt-1">Cache Hit Rate: {stats?.systemHealth.redisCacheHitRate}%</div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-white">Direct Administrative Actions</h3>
                <p className="text-xs text-slate-400 mt-0.5">Quickly create hackathons, review pending safety flags, or tune algorithm weights.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateOppModal(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish New Event</span>
                </button>
                <button
                  onClick={() => setActiveAdminTab('reports')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Review {reports.filter((r) => r.status === 'pending').length} Flags</span>
                </button>
              </div>
            </div>
          </div>
        ) : activeAdminTab === 'users' ? (
          /* TAB 2: SPECIAL USER MANAGEMENT & EDITING */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-white">User Directory & Special Editing</h3>
                <p className="text-xs text-slate-400">Edit any profile directly, grant verified badges, or suspend accounts.</p>
              </div>

              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Availability</th>
                      <th className="px-4 py-3">Verification</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.verifiedBadge && (
                                  <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1 rounded">Verified</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize font-medium text-slate-300">{u.role}</td>
                        <td className="px-4 py-3 capitalize text-slate-400">{u.availability.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3">
                          {u.github?.connected ? (
                            <span className="text-emerald-400 font-semibold">GitHub Connected</span>
                          ) : (
                            <span className="text-slate-500">Unconnected</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {u.isSuspended ? (
                            <span className="text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
                              Suspended
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditUser(u)}
                              className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Special Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeAdminTab === 'teams' ? (
          /* TAB 3: SQUADS & TEAMS MANAGEMENT */
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">Squads & Teams Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allTeams.map((t) => (
                <div key={t.id} className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={t.logo} alt={t.name} className="w-11 h-11 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-sm text-white">{t.name}</h4>
                        <div className="text-[11px] text-purple-400 capitalize">{t.opportunityType} Squad</div>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded capitalize">
                      {t.availability.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{t.description}</p>

                  <div className="text-[11px] text-slate-400">
                    <strong>Tech Stack:</strong> {t.techStack.join(', ')}
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{t.members.length} Members</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditTeam(t)}
                        className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Squad</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(t.id, t.name)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Delete squad"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeAdminTab === 'opportunities' ? (
          /* TAB 4: OPPORTUNITIES MANAGEMENT */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Opportunities & Hackathons Management</h3>
                <p className="text-xs text-slate-400">Publish, modify, or delete official platform competitions and accelerator events.</p>
              </div>
              <button
                onClick={() => setShowCreateOppModal(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish New Event</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allOpps.map((opp) => (
                <div key={opp.id} className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 rounded">
                        {opp.type}
                      </span>
                      <h4 className="font-bold text-base text-white mt-1">{opp.title}</h4>
                      <p className="text-xs text-slate-400">{opp.organizer}</p>
                    </div>
                    <span className="text-xs font-extrabold text-amber-300">{opp.prizePool}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{opp.headline}</p>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteOpportunity(opp.id, opp.title)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Event</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeAdminTab === 'weights' ? (
          /* TAB 5: AI MATCHING CALIBRATOR */
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 max-w-2xl mx-auto space-y-5">
            <div>
              <h3 className="font-bold text-lg text-white">AI Recommendation Weight Calibrator</h3>
              <p className="text-xs text-slate-400">Calibrate the 6 weighted coefficients of the two-sided recommendation formula.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Skill Complementarity (Target: 30%)</span>
                  <span className="font-bold text-purple-400">{Math.round(weights.skillComplementarity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.skillComplementarity}
                  onChange={(e) => setWeights({ ...weights, skillComplementarity: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Semantic Profile Similarity (Target: 20%)</span>
                  <span className="font-bold text-purple-400">{Math.round(weights.semanticSimilarity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={weights.semanticSimilarity}
                  onChange={(e) => setWeights({ ...weights, semanticSimilarity: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Goal Compatibility (Target: 15%)</span>
                  <span className="font-bold text-purple-400">{Math.round(weights.goalCompatibility * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.goalCompatibility}
                  onChange={(e) => setWeights({ ...weights, goalCompatibility: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Project Relevance (Target: 15%)</span>
                  <span className="font-bold text-purple-400">{Math.round(weights.projectRelevance * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.projectRelevance}
                  onChange={(e) => setWeights({ ...weights, projectRelevance: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Experience Relevance (Target: 10%)</span>
                  <span className="font-bold text-purple-400">{Math.round(weights.experienceRelevance * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.experienceRelevance}
                  onChange={(e) => setWeights({ ...weights, experienceRelevance: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Availability Fit (Target: 10%)</span>
                  <span className="font-bold text-purple-400">{Math.round(weights.availabilityFit * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.availabilityFit}
                  onChange={(e) => setWeights({ ...weights, availabilityFit: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Sum: <strong className={Math.abs(totalWeight - 1.0) < 0.01 ? 'text-emerald-400' : 'text-amber-400'}>
                  {Math.round(totalWeight * 100)}%
                </strong>
              </span>

              <button
                onClick={handleSaveWeights}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Deploy Weights</span>
              </button>
            </div>
          </div>
        ) : activeAdminTab === 'reports' ? (
          /* TAB 6: SAFETY & REPORTS */
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">Community Safety & Moderation Reports</h3>
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rep.targetName}</span>
                      <span className="text-xs text-rose-400 uppercase font-semibold">({rep.category})</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        rep.status === 'pending' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{rep.reason}</p>
                    <div className="text-[10px] text-slate-400 mt-1">Logged on: {new Date(rep.createdAt).toLocaleDateString()}</div>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'warned')}
                        className="px-2.5 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'suspended')}
                        className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded"
                      >
                        Suspend User
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : activeAdminTab === 'audit' ? (
          /* TAB 7: AUDIT LOG VIEW */
          <AuditLogView />
        ) : null}
      </main>

      {/* SPECIAL USER EDITING MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">Special Admin Edit: {editingUser.name}</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={editUserHeadline}
                  onChange={(e) => setEditUserHeadline(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editUserBio}
                  onChange={(e) => setEditUserBio(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Location</label>
                  <input
                    type="text"
                    value={editUserLocation}
                    onChange={(e) => setEditUserLocation(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">System Role</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="candidate">Candidate (Solo)</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Special Permissions / Flags */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Grant Official Verified Badge</span>
                  <input
                    type="checkbox"
                    checked={editUserVerifiedBadge}
                    onChange={(e) => setEditUserVerifiedBadge(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-400">Suspend Account (Flag for Abuse)</span>
                  <input
                    type="checkbox"
                    checked={editUserSuspended}
                    onChange={(e) => setEditUserSuspended(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg"
                >
                  Save Admin Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPECIAL TEAM EDITING MODAL */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-base text-white">Special Admin Edit: {editingTeam.name}</h3>
              <button onClick={() => setEditingTeam(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamEdit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Squad Name</label>
                <input
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tagline</label>
                <input
                  type="text"
                  value={editTeamTagline}
                  onChange={(e) => setEditTeamTagline(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={editTeamStack}
                  onChange={(e) => setEditTeamStack(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg"
                >
                  Update Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showCreateOppModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="font-bold text-base text-white">Publish New Official Opportunity</h3>
              <button onClick={() => setShowCreateOppModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous AI Agents Hackathon 2026"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Organizer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linux Foundation / Google Cloud"
                  value={oppOrganizer}
                  onChange={(e) => setOppOrganizer(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Opportunity Type</label>
                  <select
                    value={oppType}
                    onChange={(e) => setOppType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="contest">Coding Contest</option>
                    <option value="startup">Startup Accelerator</option>
                    <option value="open_source">Open Source Program</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Prize Pool / Grant</label>
                  <input
                    type="text"
                    value={oppPrizePool}
                    onChange={(e) => setOppPrizePool(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. $50,000 in bounties for multi-agent spatial models"
                  value={oppHeadline}
                  onChange={(e) => setOppHeadline(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Event details, guidelines, and evaluation criteria..."
                  value={oppDescription}
                  onChange={(e) => setOppDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                ></textarea>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={oppSkills}
                  onChange={(e) => setOppSkills(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateOppModal(false)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
