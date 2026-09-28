import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { Opportunity, UserProfile, Team } from '../../types/index.js';
import { 
  Trophy, 
  Clock, 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  UserCheck, 
  Send,
  X,
  Search,
  Filter
} from 'lucide-react';

export const OpportunitiesView: React.FC = () => {
  const { 
    currentUser, 
    selectedOpportunityId, 
    setSelectedOpportunityId, 
    setSelectedUserId, 
    setActiveTab, 
    addToast 
  } = useApp();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Active Opportunity Detail
  const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null);
  const [oppParticipants, setOppParticipants] = useState<UserProfile[]>([]);
  const [oppTeams, setOppTeams] = useState<Team[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, [selectedType]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.getOpportunities({
        type: selectedType === 'all' ? undefined : selectedType,
      });
      setOpportunities(res.opportunities || []);

      if (selectedOpportunityId) {
        handleViewOpportunity(selectedOpportunityId);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOpportunity = async (oppId: string) => {
    try {
      const res = await api.getOpportunityById(oppId);
      setActiveOpp(res.opportunity);
      setOppParticipants(res.participants || []);
      setOppTeams(res.registeredTeams || []);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to load opportunity details:', err);
    }
  };

  const handleRegister = async (oppId: string) => {
    try {
      await api.joinOpportunity(oppId);
      addToast('Registered for opportunity! You are now visible to others seeking teammates.', 'success');
      await loadOpportunities();
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    }
  };

  const filteredOpps = opportunities.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return o.title.toLowerCase().includes(q) || o.headline.toLowerCase().includes(q) || o.organizer.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Opportunities & Hackathons</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Global hackathons, coding contests, startup accelerators, and open-source programs. Find teammates to build with.
          </p>
        </div>

        {/* Filter Tabs (Zero-pill buttons) */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl self-start sm:self-auto flex-wrap">
          {['all', 'hackathon', 'contest', 'startup', 'open_source'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                selectedType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by title, organizer, or topic (e.g. AI, Web3, Climate, Linux)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs py-1.5 focus:outline-none"
        />
      </div>

      {/* Grid of Opportunities */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpps.map((opp) => (
            <div
              key={opp.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Banner */}
                <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={opp.bannerUrl}
                    alt={opp.title}
                    className="w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-900 uppercase">
                    {opp.type.replace('_', ' ')}
                  </div>
                  {opp.prizePool && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white px-2.5 py-1 rounded-md text-[10px] font-extrabold shadow-sm">
                      {opp.prizePool}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span>{opp.organizer}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Clock className="w-3 h-3" />
                      Closes {new Date(opp.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <h3
                    onClick={() => handleViewOpportunity(opp.id)}
                    className="font-bold text-base text-slate-900 hover:text-blue-600 cursor-pointer"
                  >
                    {opp.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{opp.description}</p>

                  {/* Skills Needed */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5 text-[11px]">
                    {opp.requiredSkills.map((s, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Meta Stats */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {opp.totalParticipants} Registered Builders
                    </span>
                    <span>Teams: {opp.teamSizeRange.min}-{opp.teamSizeRange.max} people</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleViewOpportunity(opp.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Find Teammates</span>
                </button>

                <button
                  onClick={() => handleRegister(opp.id)}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Register / Participate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Detail & Teammate Finder Modal */}
      {showDetailModal && activeOpp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                  {activeOpp.type.replace('_', ' ')}
                </span>
                <h3 className="font-bold text-lg text-slate-900">{activeOpp.title}</h3>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedOpportunityId(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed text-sm text-slate-700">{activeOpp.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Prize Pool / Grant</span>
                  <span className="font-extrabold text-amber-700 text-sm">{activeOpp.prizePool || 'Certificate & Badges'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Deadline</span>
                  <span className="font-bold text-slate-800 text-sm">{new Date(activeOpp.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Registered Participants Looking for Teammates */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-900">Registered Builders Seeking Squads:</h4>
                  <span className="text-slate-400 text-[11px]">{oppParticipants.length} candidates</span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {oppParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-slate-500 text-[11px]">{p.headline}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedUserId(p.id);
                          setShowDetailModal(false);
                          setActiveTab('profile');
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedOpportunityId(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleRegister(activeOpp.id)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Register as Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
