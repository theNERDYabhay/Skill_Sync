import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { CandidateRecommendation, TeamRecommendation, Opportunity } from '../../types/index.js';
import { 
  Sparkles, 
  Users, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Github, 
  FileText, 
  ExternalLink, 
  Zap, 
  Clock, 
  Flame,
  Send,
  UserCheck
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { 
    currentUser, 
    setActiveTab, 
    setSelectedUserId, 
    setSelectedTeamId, 
    setSelectedOpportunityId, 
    addToast,
    setActiveConversationId 
  } = useApp();

  const [candidateRecs, setCandidateRecs] = useState<CandidateRecommendation[]>([]);
  const [teamRecs, setTeamRecs] = useState<TeamRecommendation[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [candRes, teamRes, oppRes] = await Promise.all([
          api.getCandidateRecommendations(),
          api.getTeamRecommendationsForUser(),
          api.getOpportunities(),
        ]);
        setCandidateRecs(candRes.recommendations || []);
        setTeamRecs(teamRes.recommendations || []);
        setOpportunities(oppRes.opportunities || []);
      } catch (err) {
        console.error('Failed to load home dashboard recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser?.id]);

  const handleConnect = async (targetUserId: string, targetName: string) => {
    try {
      await api.sendConnectionRequest(targetUserId);
      addToast(`Collaboration request sent to ${targetName}!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Request failed', 'error');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none transform -skew-x-12"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md backdrop-blur-sm">
              {currentUser.mode === 'solo' ? 'Mode A: Solo Candidate' : 'Mode B: Team Lead'}
            </span>
            <span className="text-xs text-blue-100 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> AI Engine Active (v2.4.1)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            {currentUser.mode === 'solo'
              ? 'Discover high-synergy collaborators and teams seeking your skill set. Who should you build with next?'
              : 'Discover elite candidates to fill your open roles and build your winning hackathon or startup squad.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('discover')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Explore AI Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 font-medium px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>View Active Teams</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completeness Callout */}
      {currentUser.completenessScore < 100 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                {currentUser.completenessScore}%
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Elevate Your Match Ranking</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete your verified timeline and profiles to boost recommendation ranking by 40%.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!currentUser.github?.connected && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Connect GitHub</span>
                </button>
              )}
              {!currentUser.leetcode?.connected && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Link LeetCode</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('profile')}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Upload Resume</span>
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentUser.completenessScore}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Grid: Recommended Collaborators & Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Collaborator Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">Recommended Collaborators</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Matched for complementary skills and shared collaboration goals</p>
            </div>
            <button
              onClick={() => setActiveTab('discover')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>See all matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : candidateRecs.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm">
              No recommendations found yet. Try adjusting your target skills in your profile!
            </div>
          ) : (
            <div className="space-y-4">
              {candidateRecs.slice(0, 3).map(({ user, recommendation }) => (
                <div
                  key={user.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-13 h-13 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setActiveTab('profile');
                            }}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-base"
                          >
                            {user.name}
                          </h3>
                          <span className="text-[11px] text-slate-400 capitalize">{user.location}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5">{user.headline}</p>

                        {/* Top Skills (Clean unboxed typography) */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 flex-wrap">
                          <span className="font-semibold text-slate-700">Skills:</span>
                          {user.skills.slice(0, 4).map((s, idx) => (
                            <span key={s.id} className="text-slate-700">
                              {s.name}
                              {idx < Math.min(user.skills.length, 4) - 1 && <span className="text-slate-300 ml-2">·</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Score Widget */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0">
                      <div className="text-right">
                        <div className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {recommendation.overallScore}%
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Synergy Fit</div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleConnect(user.id, user.name)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Explainable AI: Why this match? */}
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Why this match?</span>
                    </div>
                    <ul className="space-y-1">
                      {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Teams Looking For Your Skills */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Teams Seeking Your Skills</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Existing teams with missing roles that match your capabilities</p>
              </div>
              <button
                onClick={() => setActiveTab('teams')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all teams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamRecs.slice(0, 2).map(({ team, recommendation, bestFitRole }) => (
                <div
                  key={team.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{team.name}</h4>
                          <span className="text-[11px] text-blue-600 font-medium capitalize">{team.opportunityType} Squad</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                        {recommendation.overallScore}% Fit
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">{team.tagline}</p>

                    {bestFitRole && (
                      <div className="mt-3 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                        <div className="text-[10px] uppercase font-bold text-blue-700">Open Role Match</div>
                        <div className="text-xs font-semibold text-slate-900">{bestFitRole.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Required: {bestFitRole.requiredSkills.join(', ')}</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{team.members.length} / {team.teamSizeMax} Members</span>
                    <button
                      onClick={() => {
                        setSelectedTeamId(team.id);
                        setActiveTab('teams');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View Team Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Opportunities / Hackathons & Quick Actions */}
        <div className="space-y-6">
          {/* Urgent Opportunities */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Active Opportunities</h3>
              </div>
              <button
                onClick={() => setActiveTab('opportunities')}
                className="text-xs text-blue-600 font-medium"
              >
                Explore
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {opportunities.slice(0, 3).map((opp) => (
                <div key={opp.id} className="py-3 group">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      {opp.type}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(opp.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 
                    onClick={() => {
                      setSelectedOpportunityId(opp.id);
                      setActiveTab('opportunities');
                    }}
                    className="font-semibold text-xs text-slate-900 mt-1 hover:text-blue-600 cursor-pointer group-hover:underline"
                  >
                    {opp.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{opp.headline}</p>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">{opp.totalParticipants} Participants</span>
                    <button
                      onClick={() => {
                        setSelectedOpportunityId(opp.id);
                        setActiveTab('opportunities');
                      }}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Find Teammates →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Platform Statistics */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">SkillSync Network Status</h4>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <div className="text-lg font-extrabold text-blue-600">840+</div>
                <div className="text-[11px] text-slate-500">Active Collaborators</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <div className="text-lg font-extrabold text-purple-600">96.4%</div>
                <div className="text-[11px] text-slate-500">Team Match Rate</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <div className="text-lg font-extrabold text-emerald-600">42</div>
                <div className="text-[11px] text-slate-500">Hackathon Pods</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <div className="text-lg font-extrabold text-amber-600">$200k+</div>
                <div className="text-[11px] text-slate-500">Prize Pools Open</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
