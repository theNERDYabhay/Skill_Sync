import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { UserProfile, ResumeExtractedData, SkillCategory } from '../../types/index.js';
import { 
  User, 
  MapPin, 
  Clock, 
  Sparkles, 
  Github, 
  Code2, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Check, 
  Shield, 
  Download, 
  AlertTriangle,
  RefreshCw,
  Edit2,
  X
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    selectedUserId, 
    setSelectedUserId, 
    refreshUserData, 
    addToast,
    setActiveConversationId,
    setActiveTab
  } = useApp();

  const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'skills' | 'timeline' | 'integrations' | 'privacy'>('overview');

  // Resume Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [parsingResume, setParsingResume] = useState(false);
  const [extractedData, setExtractedData] = useState<ResumeExtractedData | null>(null);

  // New Skill Modal
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');

  // New Project Modal
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projRole, setProjRole] = useState('Lead Developer');
  const [projTech, setProjTech] = useState('React, TypeScript, Tailwind');
  const [projGithub, setProjGithub] = useState('');
  const [projDemo, setProjDemo] = useState('');

  // GitHub / LeetCode Sync Inputs
  const [ghUsernameInput, setGhUsernameInput] = useState('');
  const [lcUsernameInput, setLcUsernameInput] = useState('');
  const [syncingGh, setSyncingGh] = useState(false);
  const [syncingLc, setSyncingLc] = useState(false);

  const isOwnProfile = !selectedUserId || selectedUserId === currentUser?.id;

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        if (selectedUserId && selectedUserId !== currentUser?.id) {
          const res = await api.getUserById(selectedUserId);
          setViewedUser(res.user);
        } else {
          setViewedUser(currentUser);
          if (currentUser?.github?.username) setGhUsernameInput(currentUser.github.username);
          if (currentUser?.leetcode?.username) setLcUsernameInput(currentUser.leetcode.username);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [selectedUserId, currentUser]);

  const handleUpdateAvailability = async (availability: any) => {
    if (!currentUser) return;
    try {
      await api.updateUser(currentUser.id, { availability });
      await refreshUserData();
      addToast('Availability updated', 'success');
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  const handleUpdateMode = async (mode: 'solo' | 'team') => {
    if (!currentUser) return;
    try {
      await api.updateUser(currentUser.id, { mode });
      await refreshUserData();
      addToast(`Switched active mode to ${mode === 'solo' ? 'Solo Candidate' : 'Team Lead'}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  const handleAddSkill = async () => {
    if (!currentUser || !newSkillName.trim()) return;
    try {
      await api.addSkill(currentUser.id, {
        name: newSkillName.trim(),
        proficiency: newSkillProficiency,
        yearsOfExperience: 2,
      });
      await refreshUserData();
      setNewSkillName('');
      setShowAddSkillModal(false);
      addToast('Skill added to profile', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to add skill', 'error');
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!currentUser) return;
    try {
      await api.removeSkill(currentUser.id, skillId);
      await refreshUserData();
      addToast('Skill removed', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to remove skill', 'error');
    }
  };

  const handleAddProject = async () => {
    if (!currentUser || !projTitle.trim()) return;
    try {
      await api.addProject(currentUser.id, {
        title: projTitle.trim(),
        description: projDesc.trim(),
        role: projRole.trim(),
        technologies: projTech.split(',').map((t) => t.trim()),
        githubUrl: projGithub.trim() || undefined,
        liveDemoUrl: projDemo.trim() || undefined,
      });
      await refreshUserData();
      setShowAddProjectModal(false);
      setProjTitle('');
      setProjDesc('');
      addToast('Project added to timeline', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to add project', 'error');
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setParsingResume(true);
    try {
      const res = await api.parseResume(resumeText, 'uploaded-resume.pdf');
      setExtractedData(res.extracted);
      addToast('Resume parsed! Please review and confirm extracted items.', 'info');
    } catch (err: any) {
      addToast(err.message || 'Parsing failed', 'error');
    } finally {
      setParsingResume(false);
    }
  };

  const handleApplyResume = async () => {
    if (!extractedData) return;
    try {
      await api.confirmAndApplyResume({
        confirmedSkills: extractedData.skills.filter((s) => s.confirmed),
        confirmedExperience: extractedData.experience.filter((e) => e.confirmed),
        confirmedProjects: extractedData.projects.filter((p) => p.confirmed),
        confirmedEducation: extractedData.education.filter((ed) => ed.confirmed),
      });
      await refreshUserData();
      setShowResumeModal(false);
      setExtractedData(null);
      setResumeText('');
      addToast('Profile successfully enriched from confirmed resume details!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to apply resume details', 'error');
    }
  };

  const handleSyncGitHub = async () => {
    if (!ghUsernameInput.trim()) return;
    setSyncingGh(true);
    try {
      await api.syncGitHub(ghUsernameInput.trim());
      await refreshUserData();
      addToast('GitHub repositories synced successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'GitHub sync failed', 'error');
    } finally {
      setSyncingGh(false);
    }
  };

  const handleToggleRepoFeatured = async (repoId: string) => {
    try {
      await api.toggleGitHubFeatured(repoId);
      await refreshUserData();
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle repo', 'error');
    }
  };

  const handleSyncLeetCode = async () => {
    if (!lcUsernameInput.trim()) return;
    setSyncingLc(true);
    try {
      await api.syncLeetCode(lcUsernameInput.trim());
      await refreshUserData();
      addToast('LeetCode statistics verified & synced!', 'success');
    } catch (err: any) {
      addToast(err.message || 'LeetCode sync failed', 'error');
    } finally {
      setSyncingLc(false);
    }
  };

  const handleExportData = () => {
    if (!currentUser) return;
    window.open(`/api/v1/users/${currentUser.id}/export`, '_blank');
    addToast('Account data package exported', 'info');
  };

  if (loading || !viewedUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        Loading professional profile...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Return button if viewing someone else */}
      {!isOwnProfile && (
        <button
          onClick={() => setSelectedUserId(null)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          ← Back to my profile
        </button>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img
              src={viewedUser.avatar}
              alt={viewedUser.name}
              className="w-24 h-24 rounded-2xl object-cover ring-2 ring-slate-100 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{viewedUser.name}</h1>
                <span className="text-xs text-slate-400">@{viewedUser.username}</span>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {viewedUser.mode === 'solo' ? 'Solo Candidate' : 'Team Lead'}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-1">{viewedUser.headline}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{viewedUser.location}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{viewedUser.commitmentHoursPerWeek} hrs/week</span>
                </span>
                <span>·</span>
                <span className="capitalize text-emerald-600 font-medium">
                  {viewedUser.availability.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-3 max-w-2xl leading-relaxed">{viewedUser.bio}</p>
            </div>
          </div>

          {/* Own Profile Quick Actions */}
          {isOwnProfile ? (
            <div className="flex flex-col sm:items-end gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={() => setShowResumeModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Upload & Enrich Resume</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={viewedUser.availability}
                  onChange={(e) => handleUpdateAvailability(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
                >
                  <option value="available_now">Available Now</option>
                  <option value="looking_for_team">Looking for Team</option>
                  <option value="open_to_collab">Open to Collab</option>
                  <option value="not_available">Not Available</option>
                </select>

                <button
                  onClick={() => handleUpdateMode(viewedUser.mode === 'solo' ? 'team' : 'solo')}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Mode: {viewedUser.mode === 'solo' ? 'Solo' : 'Team'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  try {
                    await api.sendConnectionRequest(viewedUser.id);
                    addToast(`Collaboration request sent to ${viewedUser.name}!`, 'success');
                  } catch (err: any) {
                    addToast(err.message, 'error');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Connect to Collaborate
              </button>
            </div>
          )}
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview & Goals
          </button>
          <button
            onClick={() => setActiveSubTab('skills')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'skills' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Skills Matrix ({viewedUser.skills.length})
          </button>
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'timeline' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Projects & Career Timeline
          </button>
          <button
            onClick={() => setActiveSubTab('integrations')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'integrations' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            GitHub & LeetCode Profiles
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveSubTab('privacy')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'privacy' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Privacy & Export
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Overview & Goals */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Collaboration Goals */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Collaboration Goals</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {viewedUser.goals.map((g, i) => (
                  <span key={i} className="bg-blue-50 text-blue-800 font-semibold px-3 py-1 rounded-lg border border-blue-100 capitalize">
                    {g.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Skills Seeking */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Looking for Collaborators With:</h3>
              <p className="text-xs text-slate-500 mb-4">The AI matching engine uses these to connect you with complementary teammates.</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {viewedUser.lookingForSkills.map((s, i) => (
                  <span key={i} className="bg-purple-50 text-purple-800 font-semibold px-3 py-1 rounded-lg border border-purple-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Verified Integrations Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Verified Developer Signals</h3>

              {viewedUser.github?.connected ? (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-800" />
                    <span className="font-semibold text-xs text-slate-900">{viewedUser.github.username}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    {viewedUser.github.publicReposCount} Public Repos · Top Language: {viewedUser.github.topLanguages?.[0]?.language}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400">
                  GitHub profile not connected yet
                </div>
              )}

              {viewedUser.leetcode?.connected ? (
                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-xs text-slate-900">LeetCode {viewedUser.leetcode.username}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      Rating {viewedUser.leetcode.contestRating}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600">
                    {viewedUser.leetcode.totalSolved} Problems Solved ({viewedUser.leetcode.hardSolved} Hard)
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400">
                  LeetCode stats not connected yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skills Matrix */}
      {activeSubTab === 'skills' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Skill Competency Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Normalized against the SkillSync Tech Taxonomy for cross-domain synergy matching.</p>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setShowAddSkillModal(true)}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {viewedUser.skills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">{skill.name}</span>
                    {skill.verified && (
                      <span title="Verified Skill">
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{skill.category}</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {skill.proficiency}
                    </span>
                    {skill.yearsOfExperience && (
                      <span className="text-slate-400">{skill.yearsOfExperience} yrs exp</span>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Timeline & Projects */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Projects Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Featured Projects</h3>
              {isOwnProfile && (
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {viewedUser.projects.map((proj) => (
                <div key={proj.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{proj.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{proj.role}</p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{proj.description}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>

                      {proj.outcome && (
                        <div className="mt-2 text-xs text-emerald-700 font-medium">
                          ✓ {proj.outcome}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {proj.liveDemoUrl && (
                        <a
                          href={proj.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Experience & Internships</h3>
            <div className="space-y-4">
              {viewedUser.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-blue-500 pl-4 py-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{exp.role}</h4>
                    <span className="text-xs text-slate-400">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-xs text-blue-600 font-medium">{exp.company}</div>
                  <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: GitHub & LeetCode Integrations */}
      {activeSubTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub Sync */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Github className="w-6 h-6 text-slate-900" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">GitHub Integration</h3>
                <p className="text-xs text-slate-500">Showcase public repositories and language activity</p>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="GitHub username"
                  value={ghUsernameInput}
                  onChange={(e) => setGhUsernameInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={handleSyncGitHub}
                  disabled={syncingGh}
                  className="px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingGh ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>
              </div>
            )}

            {viewedUser.github?.connected && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-700">Repositories:</div>
                {viewedUser.github.featuredRepos?.map((repo) => (
                  <div key={repo.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{repo.name}</span>
                        <span className="text-[10px] text-slate-400">★ {repo.stars}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{repo.description}</p>
                      <span className="text-[10px] text-blue-600 font-medium mt-1 inline-block">{repo.language}</span>
                    </div>

                    {isOwnProfile && (
                      <button
                        onClick={() => handleToggleRepoFeatured(repo.id)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                          repo.featured ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {repo.featured ? 'Featured' : 'Hidden'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LeetCode Sync */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">LeetCode Integration</h3>
                <p className="text-xs text-slate-500">Verified contest rating and algorithmic problem solving</p>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="LeetCode username"
                  value={lcUsernameInput}
                  onChange={(e) => setLcUsernameInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  onClick={handleSyncLeetCode}
                  disabled={syncingLc}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingLc ? 'animate-spin' : ''}`} />
                  <span>Verify</span>
                </button>
              </div>
            )}

            {viewedUser.leetcode?.connected && (
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Source: LeetCode (Verified)</span>
                  <span className="text-xs text-slate-400">Synced: {new Date(viewedUser.leetcode.lastSyncedAt || '').toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <div className="text-sm font-extrabold text-slate-900">{viewedUser.leetcode.totalSolved}</div>
                    <div className="text-[10px] text-slate-500">Total Solved</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <div className="text-sm font-extrabold text-blue-600">{viewedUser.leetcode.mediumSolved}</div>
                    <div className="text-[10px] text-slate-500">Medium</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <div className="text-sm font-extrabold text-rose-600">{viewedUser.leetcode.hardSolved}</div>
                    <div className="text-[10px] text-slate-500">Hard</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600">Contest Rating:</span>
                  <span className="font-bold text-amber-700">{viewedUser.leetcode.contestRating}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Privacy & Account Settings */}
      {activeSubTab === 'privacy' && isOwnProfile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Privacy & Visibility Controls</h3>
            <p className="text-xs text-slate-500 mt-0.5">Control which parts of your timeline and verified stats are visible to the network.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
              <div>
                <div className="font-semibold text-xs text-slate-900">Public Profile Visibility</div>
                <div className="text-[11px] text-slate-500">Allow other candidates and teams to find you in discovery</div>
              </div>
              <input
                type="checkbox"
                checked={viewedUser.privacy.profileVisibility === 'public'}
                onChange={async (e) => {
                  await api.updatePrivacy(viewedUser.id, {
                    profileVisibility: e.target.checked ? 'public' : 'members_only',
                  });
                  await refreshUserData();
                  addToast('Privacy settings saved', 'info');
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
              <div>
                <div className="font-semibold text-xs text-slate-900">Showcase Verified LeetCode Rating</div>
                <div className="text-[11px] text-slate-500">Display your verified algorithmic score to hackathon teams</div>
              </div>
              <input
                type="checkbox"
                checked={viewedUser.privacy.leetcodeVisibility}
                onChange={async (e) => {
                  await api.updatePrivacy(viewedUser.id, {
                    leetcodeVisibility: e.target.checked,
                  });
                  await refreshUserData();
                  addToast('Privacy settings saved', 'info');
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>

          {/* Data Export & Account Deletion */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleExportData}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export Account Data (JSON)</span>
            </button>

            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete your SkillSync account? This action is irreversible.')) {
                  await api.deleteAccount(viewedUser.id);
                  addToast('Account deleted', 'info');
                  window.location.reload();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Resume Upload & Review Pipeline Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Resume Parsing & Verification Pipeline</h3>
              </div>
              <button onClick={() => setShowResumeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!extractedData ? (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-slate-600">
                  Paste your resume text or bio below. Our extraction engine will identify skills, experience, and projects for your review.
                </p>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste resume contents here (e.g. Senior Software Engineer with expertise in Python, PyTorch, React, TypeScript, Docker...)"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                ></textarea>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setResumeText(
                        `Senior Full-Stack Engineer with 5+ years experience building distributed platforms. Proficient in React, TypeScript, Python, FastAPI, Docker, and PostgreSQL. Created distributed caching system and published React design tokens library.`
                      );
                    }}
                    className="text-xs text-blue-600 font-medium hover:underline mr-auto"
                  >
                    Insert Sample Resume
                  </button>

                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleParseResume}
                    disabled={parsingResume || !resumeText.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    {parsingResume ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Parse Resume</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl text-xs text-blue-800">
                  <strong>Verification Required:</strong> We never automatically commit extracted data. Confirm, uncheck, or edit items before saving.
                </div>

                {/* Extracted Skills */}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 mb-2">We found these skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.skills.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const updated = { ...extractedData };
                          updated.skills[idx].confirmed = !updated.skills[idx].confirmed;
                          setExtractedData(updated);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                          s.confirmed
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-400 line-through border-slate-200'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extracted Projects */}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 mb-2">Extracted Projects:</h4>
                  <div className="space-y-2">
                    {extractedData.projects.map((p, idx) => (
                      <div key={idx} className="p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{p.title}</div>
                          <div className="text-slate-600 mt-0.5">{p.description}</div>
                          <div className="text-slate-400 mt-1">Tech: {p.tech.join(', ')}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={p.confirmed}
                          onChange={(e) => {
                            const updated = { ...extractedData };
                            updated.projects[idx].confirmed = e.target.checked;
                            setExtractedData(updated);
                          }}
                          className="w-4 h-4 text-blue-600 rounded ml-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setExtractedData(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleApplyResume}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Confirmed Items to Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Skill to Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. React, PyTorch, Go, Figma, Docker"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Proficiency Level</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Save Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Project to Timeline</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Task Queue"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Role / Contribution</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Architect & Creator"
                  value={projRole}
                  onChange={(e) => setProjRole(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the problem solved and technical impact..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Go, PostgreSQL"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">GitHub URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Live Demo URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={projDemo}
                    onChange={(e) => setProjDemo(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
