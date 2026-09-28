import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { CandidateRecommendation, TeamRecommendation, UserProfile, Team } from '../../types/index.js';
import { 
  Sparkles, 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Send, 
  ExternalLink, 
  Github, 
  Code2, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Bookmark, 
  X,
  UserPlus,
  Briefcase
} from 'lucide-react';

export const DiscoveryView: React.FC = () => {
  const { 
    currentUser, 
    setSelectedUserId, 
    setSelectedTeamId, 
    setActiveTab, 
    addToast, 
    openReportModal 
  } = useApp();

  const [activeSegment, setActiveSegment] = useState<'complementary_people' | 'teams_seeking_me' | 'directory_people' | 'directory_teams'>('complementary_people');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState('');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const [candidateRecs, setCandidateRecs] = useState<CandidateRecommendation[]>([]);
  const [teamRecs, setTeamRecs] = useState<TeamRecommendation[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<UserProfile[]>([]);
  const [directoryTeams, setDirectoryTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Connect modal state
  const [connectModalUser, setConnectModalUser] = useState<UserProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState('');

  useEffect(() => {
    loadDiscoveryData();
  }, [currentUser?.id, activeSegment]);

  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      if (activeSegment === 'complementary_people') {
        const res = await api.getCandidateRecommendations();
        setCandidateRecs(res.recommendations || []);
      } else if (activeSegment === 'teams_seeking_me') {
        const res = await api.getTeamRecommendationsForUser();
        setTeamRecs(res.recommendations || []);
      } else if (activeSegment === 'directory_people') {
        const res = await api.getUsers({ query: searchQuery, skill: selectedSkillFilter, goal: selectedGoalFilter });
        setDirectoryUsers(res.users || []);
      } else if (activeSegment === 'directory_teams') {
        const res = await api.getTeams({ query: searchQuery });
        setDirectoryTeams(res.teams || []);
      }
    } catch (err) {
      console.error('Failed to load discovery data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    addToast('Candidate removed from active suggestions', 'info');
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        addToast('Removed from saved list', 'info');
      } else {
        next.add(id);
        addToast('Saved to your collaboration wishlist', 'success');
      }
      return next;
    });
  };

  const handleSendConnection = async () => {
    if (!connectModalUser) return;
    try {
      await api.sendConnectionRequest(connectModalUser.id, connectMessage);
      addToast(`Collaboration request sent to ${connectModalUser.name}!`, 'success');
      setConnectModalUser(null);
      setConnectMessage('');
    } catch (err: any) {
      addToast(err.message || 'Failed to send connection', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Collaboration Discovery</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Find the right people who make your team stronger. Optimized for skill complementarity and shared goals.
          </p>
        </div>

        {/* Segmented Controls (Interactive buttons conforming to zero-pill rules) */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl self-start md:self-auto flex-wrap">
          <button
            onClick={() => setActiveSegment('complementary_people')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSegment === 'complementary_people'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Complementary People
          </button>
          <button
            onClick={() => setActiveSegment('teams_seeking_me')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSegment === 'teams_seeking_me'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Teams Seeking My Skills
          </button>
          <button
            onClick={() => setActiveSegment('directory_people')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSegment === 'directory_people'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            People Directory
          </button>
          <button
            onClick={() => setActiveSegment('directory_teams')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSegment === 'directory_teams'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Teams Directory
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, role, technology (e.g. PyTorch, React, Figma)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <select
          value={selectedGoalFilter}
          onChange={(e) => setSelectedGoalFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Collaboration Goals</option>
          <option value="hackathons">Hackathons</option>
          <option value="startups">Startups</option>
          <option value="open_source">Open Source</option>
          <option value="research">Research</option>
          <option value="projects">Side Projects</option>
        </select>

        <button
          onClick={loadDiscoveryData}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Filter
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : activeSegment === 'complementary_people' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidateRecs
            .filter((c) => !dismissedIds.has(c.user.id))
            .map(({ user, recommendation }) => (
              <div
                key={user.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setActiveTab('profile');
                            }}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-lg"
                          >
                            {user.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 font-medium line-clamp-1">{user.headline}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{user.location}</span>
                          <span>·</span>
                          <Clock className="w-3 h-3" />
                          <span>{user.commitmentHoursPerWeek}h/wk</span>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Score Circle */}
                    <div className="text-right shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-50 to-purple-50 border border-purple-100 flex flex-col items-center justify-center">
                        <span className="text-base font-extrabold text-blue-700 leading-none">
                          {recommendation.overallScore}%
                        </span>
                        <span className="text-[9px] font-bold text-purple-600 tracking-tight uppercase mt-0.5">Synergy</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-2">{user.bio}</p>

                  {/* Skills Grid */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold text-slate-700">Demonstrated Capabilities:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {user.skills.slice(0, 5).map((s) => (
                        <span key={s.id} className="text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Looking For */}
                  {user.lookingForSkills?.length > 0 && (
                    <div className="mt-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Looking For: </span>
                      <span>{user.lookingForSkills.join(', ')}</span>
                    </div>
                  )}

                  {/* External Badges: GitHub / LeetCode */}
                  <div className="mt-3.5 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    {user.github?.connected && (
                      <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-[11px]">
                        <Github className="w-3.5 h-3.5 text-slate-700" />
                        <span>{user.github.username}</span>
                        <span className="text-slate-400">({user.github.publicReposCount} repos)</span>
                      </span>
                    )}

                    {user.leetcode?.connected && (
                      <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md text-[11px] text-amber-900 font-medium">
                        <Code2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>LeetCode Rating: {user.leetcode.contestRating}</span>
                      </span>
                    )}
                  </div>

                  {/* Explainable AI: Why this match? */}
                  <div className="mt-4 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Why This Match?</span>
                    </div>
                    <ul className="space-y-1">
                      {recommendation.reasons.map((r, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleSave(user.id)}
                      className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors ${
                        savedIds.has(user.id) ? 'text-blue-600 bg-blue-50' : ''
                      }`}
                      title="Save candidate"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openReportModal({ targetType: 'user', targetId: user.id, targetName: user.name })}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Report profile"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDismiss(user.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                      title="Not interested"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setActiveTab('profile');
                      }}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setConnectModalUser(user);
                        setConnectMessage(`Hi ${user.name}, I saw your work and think our skills would complement each other well. Would you be interested in collaborating?`);
                      }}
                      className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : activeSegment === 'teams_seeking_me' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamRecs.map(({ team, recommendation, bestFitRole }) => (
            <div
              key={team.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img src={team.logo} alt={team.name} className="w-13 h-13 rounded-xl object-cover ring-1 ring-slate-200" />
                    <div>
                      <h3
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setActiveTab('teams');
                        }}
                        className="font-bold text-slate-900 text-lg hover:text-blue-600 cursor-pointer"
                      >
                        {team.name}
                      </h3>
                      <p className="text-xs text-blue-600 font-medium capitalize">{team.opportunityType} Squad · {team.members.length}/{team.teamSizeMax} Members</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {recommendation.overallScore}% Fit
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{team.description}</p>

                {/* Best Fit Open Requirement */}
                {bestFitRole && (
                  <div className="mt-4 bg-blue-50/80 border border-blue-100 rounded-xl p-3.5">
                    <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Role Seeking Your Capabilities</div>
                    <div className="font-bold text-xs text-slate-900 mt-1">{bestFitRole.title}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{bestFitRole.description}</div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                      <span className="font-semibold text-slate-700">Required:</span>
                      {bestFitRole.requiredSkills.map((s, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded text-blue-900 font-medium border border-blue-200 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Tech Stack */}
                <div className="mt-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Current Stack: </span>
                  <span>{team.techStack.join(', ')}</span>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setActiveTab('teams');
                  }}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  View Team Details
                </button>

                <button
                  onClick={() => {
                    addToast(`Expressed interest in joining ${team.name}! The team lead has been notified.`, 'success');
                  }}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join Team</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeSegment === 'directory_people' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {directoryUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200" />
                  <div>
                    <h4
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setActiveTab('profile');
                      }}
                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-sm"
                    >
                      {user.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{user.headline}</p>
                    <span className="text-[11px] text-emerald-600 font-medium capitalize mt-1 inline-block">
                      {user.availability.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">{user.bio}</p>

                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  {user.skills.slice(0, 4).map((s) => (
                    <span key={s.id} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setActiveTab('profile');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setConnectModalUser(user);
                    setConnectMessage(`Hi ${user.name}, I would love to connect on SkillSync!`);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {directoryTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{team.name}</h4>
                    <span className="text-xs text-blue-600 capitalize">{team.opportunityType}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{team.tagline}</p>

                <div className="mt-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Open Roles: </span>
                  <span>{team.openRequirements.filter((r) => !r.isFilled).map((r) => r.title).join(', ') || 'No open roles'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{team.members.length} Members</span>
                <button
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setActiveTab('teams');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View Team
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connection Note Modal */}
      {connectModalUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Connect with {connectModalUser.name}</h3>
              <button onClick={() => setConnectModalUser(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-600 mb-2">
                Include a message explaining what you would like to collaborate on:
              </p>
              <textarea
                rows={4}
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Share your goals, project ideas, or target hackathons..."
              ></textarea>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setConnectModalUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnection}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
