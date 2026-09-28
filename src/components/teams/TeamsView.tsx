import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { Team, CandidateRecommendation, UserProfile } from '../../types/index.js';
import { 
  Users, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  UserPlus, 
  Send, 
  ExternalLink, 
  Github, 
  Briefcase, 
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export const TeamsView: React.FC = () => {
  const { 
    currentUser, 
    selectedTeamId, 
    setSelectedTeamId, 
    setSelectedUserId, 
    setActiveTab, 
    addToast 
  } = useApp();

  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [teamCandidates, setTeamCandidates] = useState<CandidateRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Team Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamTagline, setTeamTagline] = useState('');
  const [teamMission, setTeamMission] = useState('');
  const [teamProject, setTeamProject] = useState('');
  const [teamStack, setTeamStack] = useState('React, TypeScript, Python, FastAPI');
  const [teamOppType, setTeamOppType] = useState<'hackathon' | 'startup' | 'open_source' | 'contest'>('hackathon');
  const [roleTitle1, setRoleTitle1] = useState('Lead Frontend Developer');
  const [roleSkills1, setRoleSkills1] = useState('React, TypeScript, Tailwind CSS');

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCandidateId, setInviteCandidateId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    loadTeams();
  }, [selectedTeamId]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await api.getTeams();
      setTeams(res.teams || []);

      if (selectedTeamId) {
        const teamRes = await api.getTeamById(selectedTeamId);
        setActiveTeam(teamRes.team);
        // Load candidates recommended for this team
        const candRes = await api.getCandidateRecommendationsForTeam(selectedTeamId);
        setTeamCandidates(candRes.recommendations || []);
      } else if (res.teams.length > 0) {
        setActiveTeam(res.teams[0]);
        const candRes = await api.getCandidateRecommendationsForTeam(res.teams[0].id);
        setTeamCandidates(candRes.recommendations || []);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    try {
      const newTeam = await api.createTeam({
        name: teamName.trim(),
        tagline: teamTagline.trim(),
        mission: teamMission.trim(),
        projectFocus: teamProject.trim(),
        techStack: teamStack.split(',').map((s) => s.trim()),
        opportunityType: teamOppType,
        openRequirements: [
          {
            title: roleTitle1,
            requiredSkills: roleSkills1.split(',').map((s) => s.trim()),
            proficiencyNeeded: 'advanced',
          },
        ] as any,
      });

      addToast(`Team "${teamName}" created!`, 'success');
      setShowCreateModal(false);
      setSelectedTeamId(newTeam.team.id);
      await loadTeams();
    } catch (err: any) {
      addToast(err.message || 'Failed to create team', 'error');
    }
  };

  const handleToggleRequirement = async (reqId: string) => {
    if (!activeTeam) return;
    try {
      const res = await api.toggleTeamRequirement(activeTeam.id, reqId);
      setActiveTeam(res.team);
      addToast(res.message, 'info');
    } catch (err: any) {
      addToast(err.message || 'Toggle failed', 'error');
    }
  };

  const handleInviteCandidate = async (candidateId: string, candidateName: string) => {
    if (!activeTeam) return;
    try {
      await api.inviteToTeam(activeTeam.id, candidateId, undefined, inviteMessage);
      addToast(`Invitation sent to ${candidateName}!`, 'success');
      setShowInviteModal(false);
      setInviteMessage('');
    } catch (err: any) {
      addToast(err.message || 'Invitation failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Collaboration Squads & Teams</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Build your team with complementary disciplines. Define missing roles and discover qualified builders.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Form New Team</span>
        </button>
      </div>

      {/* Main Two-Pane View: Team Selector & Team Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Team List */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Available Squads</h3>
          {teams.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setSelectedTeamId(t.id);
                setActiveTeam(t);
                api.getCandidateRecommendationsForTeam(t.id).then((r) => setTeamCandidates(r.recommendations || []));
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeTeam?.id === t.id
                  ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={t.logo} alt={t.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200" />
                <div className="truncate">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{t.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="capitalize text-blue-600 font-medium">{t.opportunityType}</span>
                    <span>·</span>
                    <span>{t.members.length}/{t.teamSizeMax} Members</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Area: Active Team Details & AI Recommendations for Open Roles */}
        {activeTeam && (
          <div className="lg:col-span-2 space-y-6">
            {/* Team Overview Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={activeTeam.logo}
                    alt={activeTeam.name}
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{activeTeam.name}</h2>
                    <p className="text-xs text-blue-600 font-semibold uppercase mt-0.5">{activeTeam.tagline}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{activeTeam.description}</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 capitalize shrink-0">
                  {activeTeam.availability.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Tech Stack */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                <span className="font-bold text-slate-700">Tech Stack:</span>
                {activeTeam.techStack.map((tech, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Current Members */}
              <div className="mt-5">
                <h4 className="font-bold text-xs text-slate-900 mb-2.5">Current Team Members:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeTeam.members.map((m) => (
                    <div
                      key={m.userId}
                      onClick={() => {
                        setSelectedUserId(m.userId);
                        setActiveTab('profile');
                      }}
                      className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      <img src={m.user.avatar} alt={m.user.name} className="w-9 h-9 rounded-lg object-cover" />
                      <div className="truncate">
                        <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                          <span>{m.user.name}</span>
                          {m.isLead && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 rounded">Lead</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Open Role Requirements & Missing Skills */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Open Roles & Missing Skills</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Define missing disciplines to trigger automatic candidate matching.</p>
                </div>
              </div>

              <div className="space-y-3">
                {activeTeam.openRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      req.isFilled ? 'bg-slate-50/60 border-slate-200 opacity-60' : 'bg-blue-50/30 border-blue-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{req.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          req.isFilled ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {req.isFilled ? 'Filled' : 'Open Role'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{req.description}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-700">Required:</span>
                        {req.requiredSkills.map((s, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleRequirement(req.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 self-start sm:self-auto shrink-0 transition-colors"
                    >
                      {req.isFilled ? 'Mark as Open' : 'Mark as Filled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations for this Team */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-base text-slate-900">Recommended Candidates for {activeTeam.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Candidates whose capabilities complement your missing roles</p>
                </div>
              </div>

              <div className="space-y-4">
                {teamCandidates.slice(0, 3).map(({ user, recommendation, recommendedForRequirementId }) => {
                  const targetReq = activeTeam.openRequirements.find((r) => r.id === recommendedForRequirementId);
                  return (
                    <div
                      key={user.id}
                      className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-white flex flex-col sm:flex-row items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setActiveTab('profile');
                              }}
                              className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer"
                            >
                              {user.name}
                            </h4>
                            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {recommendation.overallScore}% Fit
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{user.headline}</p>

                          {targetReq && (
                            <div className="text-[11px] text-purple-700 font-semibold mt-1">
                              Fit for open role: {targetReq.title}
                            </div>
                          )}

                          <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                            {user.skills.slice(0, 4).map((s) => (
                              <span key={s.id} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setActiveTab('profile');
                          }}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5"
                        >
                          View Portfolio
                        </button>
                        <button
                          onClick={() => handleInviteCandidate(user.id, user.name)}
                          className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Invite to Team</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Collaboration Team</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. NeuroCraft AI"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="Brief one-line summary of what you are building"
                  value={teamTagline}
                  onChange={(e) => setTeamTagline(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Mission / Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain the problem and why you need teammates..."
                  value={teamMission}
                  onChange={(e) => setTeamMission(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Opportunity Type</label>
                  <select
                    value={teamOppType}
                    onChange={(e) => setTeamOppType(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="startup">Startup</option>
                    <option value="open_source">Open Source</option>
                    <option value="contest">Contest</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Project Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. Healthcare AI"
                    value={teamProject}
                    onChange={(e) => setTeamProject(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="Python, PyTorch, React, TypeScript"
                  value={teamStack}
                  onChange={(e) => setTeamStack(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 mb-2">First Open Role Requirement</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Role Title (e.g. Lead Frontend Engineer)"
                    value={roleTitle1}
                    onChange={(e) => setRoleTitle1(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Required Skills (e.g. React, TypeScript, Figma)"
                    value={roleSkills1}
                    onChange={(e) => setRoleSkills1(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Launch Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
