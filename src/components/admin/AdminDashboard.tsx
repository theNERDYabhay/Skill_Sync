import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { AdminStats, ModerationReport } from '../../types/index.js';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Sliders, 
  Users, 
  Database, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Save,
  Check
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { addToast } = useApp();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Recommendation Weights local state for tuning
  const [weights, setWeights] = useState({
    skillComplementarity: 0.30,
    semanticSimilarity: 0.20,
    goalCompatibility: 0.15,
    projectRelevance: 0.15,
    experienceRelevance: 0.10,
    availabilityFit: 0.10,
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReports(),
      ]);
      setStats(statsRes.stats);
      setReports(reportsRes.reports || []);
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
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWeights = async () => {
    try {
      await api.updateAdminWeights(weights);
      addToast('AI Recommendation Engine weights calibrated and deployed!', 'success');
      await loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update weights', 'error');
    }
  };

  const handleModerationAction = async (reportId: string, action: string) => {
    try {
      await api.resolveAdminReport(reportId, action);
      addToast(`Action "${action}" taken on report`, 'success');
      await loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to take moderation action', 'error');
    }
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        Loading admin telemetry & moderation queue...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-slate-800" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Administration & AI Tuning</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry, two-sided recommendation weight calibrator, and moderation queue.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalUsers}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">+{stats.activeUsers} active this week</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collaboration Squads</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{stats.totalTeams}</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.teamFormationsCount} teams formed</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Matches Generated</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">{stats.totalMatchesGenerated}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">{stats.successfulConnections} mutual matches</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Latency (P99)</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.systemHealth.mlEngineLatencyMs}ms</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Cache Hit Rate: {stats.systemHealth.redisCacheHitRate}%</div>
        </div>
      </div>

      {/* Two Column Layout: Recommendation Tuning & Moderation Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommendation Engine Weight Calibrator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">AI Recommendation Engine Calibrator</h3>
                <p className="text-xs text-slate-500">Live calibration weights for candidate-to-team matching</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
              {stats.recommendationWeights.modelVersion}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Skill Complementarity (30% baseline)</span>
                <span className="font-bold text-blue-600">{Math.round(weights.skillComplementarity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.skillComplementarity}
                onChange={(e) => setWeights({ ...weights, skillComplementarity: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Semantic Profile Similarity (20% baseline)</span>
                <span className="font-bold text-blue-600">{Math.round(weights.semanticSimilarity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.semanticSimilarity}
                onChange={(e) => setWeights({ ...weights, semanticSimilarity: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Goal Compatibility (15% baseline)</span>
                <span className="font-bold text-blue-600">{Math.round(weights.goalCompatibility * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.goalCompatibility}
                onChange={(e) => setWeights({ ...weights, goalCompatibility: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Project Relevance (15% baseline)</span>
                <span className="font-bold text-blue-600">{Math.round(weights.projectRelevance * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.projectRelevance}
                onChange={(e) => setWeights({ ...weights, projectRelevance: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Experience Relevance (10% baseline)</span>
                <span className="font-bold text-blue-600">{Math.round(weights.experienceRelevance * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.experienceRelevance}
                onChange={(e) => setWeights({ ...weights, experienceRelevance: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Availability Fit (10% baseline)</span>
                <span className="font-bold text-blue-600">{Math.round(weights.availabilityFit * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.availabilityFit}
                onChange={(e) => setWeights({ ...weights, availabilityFit: parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Total Weight: <strong className={Math.abs(totalWeight - 1.0) < 0.01 ? 'text-emerald-600' : 'text-amber-600'}>
                {Math.round(totalWeight * 100)}%
              </strong>
            </span>

            <button
              onClick={handleSaveWeights}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Deploy Weights</span>
            </button>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">Community Safety & Moderation</h3>
                <p className="text-xs text-slate-500">Reported users, spam flags, and resolution audit</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {reports.length} Reports
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No active moderation flags. Platform collaboration signals are clean.
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{report.targetName} ({report.targetType})</div>
                      <div className="text-[11px] text-rose-600 font-semibold uppercase">{report.category}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      report.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{report.reason}</p>

                  {report.status === 'pending' && (
                    <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => handleModerationAction(report.id, 'dismissed')}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleModerationAction(report.id, 'warned')}
                        className="px-2.5 py-1 bg-amber-500 text-white font-semibold rounded hover:bg-amber-600"
                      >
                        Warn User
                      </button>
                      <button
                        onClick={() => handleModerationAction(report.id, 'suspended')}
                        className="px-2.5 py-1 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700"
                      >
                        Suspend
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
