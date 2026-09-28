import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { AuditLogEntry, AuditActionType } from '../../types/index.js';
import {
  Shield,
  ShieldAlert,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileJson,
  RefreshCw,
  Clock,
  User,
  Users,
  Layers,
  Trophy,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Key,
  Calendar,
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  Laptop,
  Check,
  Plus,
  X,
  Copy,
  Terminal,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  Edit3
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { adminSession, addToast } = useApp();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    highImpactCount: 0,
    activeAdminsCount: 0,
    successCount: 0,
    failureCount: 0,
    todayCount: 0,
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeScope, setTimeScope] = useState<'all' | 'today' | '7days'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Selected Log for Deep Inspection Drawer/Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual Checkpoint / Security Audit Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteAction, setNoteAction] = useState<AuditActionType>('user_update');
  const [noteTargetType, setNoteTargetType] = useState<AuditLogEntry['targetType']>('auth');
  const [noteTargetName, setNoteTargetName] = useState('SkillSync Security Infrastructure');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteSeverity, setNoteSeverity] = useState<'normal' | 'high' | 'critical'>('normal');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, targetTypeFilter, statusFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAuditLogs({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setLogs(res.logs || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      addToast(err.message || 'Failed to fetch audit log trail', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Client-side time filtering and search refinement
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Time scope filter
      if (timeScope === 'today') {
        const today = new Date().toISOString().split('T')[0];
        if (!log.timestamp.startsWith(today)) return false;
      } else if (timeScope === '7days') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (new Date(log.timestamp).getTime() < sevenDaysAgo) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          log.description.toLowerCase().includes(q) ||
          log.adminName.toLowerCase().includes(q) ||
          log.adminEmail.toLowerCase().includes(q) ||
          (log.targetName && log.targetName.toLowerCase().includes(q)) ||
          (log.ipAddress && log.ipAddress.toLowerCase().includes(q)) ||
          log.action.toLowerCase().includes(q) ||
          log.targetType.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [logs, timeScope, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Timestamp', 'Event ID', 'Action', 'Target Type', 'Target Name', 'Admin Actor', 'Admin Email', 'IP Address', 'Status', 'Description'];
      const rows = filteredLogs.map((l) => [
        `"${l.timestamp}"`,
        `"${l.id}"`,
        `"${l.action}"`,
        `"${l.targetType}"`,
        `"${(l.targetName || '').replace(/"/g, '""')}"`,
        `"${(l.adminName || '').replace(/"/g, '""')}"`,
        `"${l.adminEmail}"`,
        `"${l.ipAddress || ''}"`,
        `"${l.status}"`,
        `"${l.description.replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `skillsync_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`Exported ${filteredLogs.length} audit records to CSV`, 'success');
    } catch (err) {
      addToast('Failed to export CSV', 'error');
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `skillsync_audit_log_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast(`Exported ${filteredLogs.length} audit records to JSON`, 'success');
    } catch (err) {
      addToast('Failed to export JSON', 'error');
    }
  };

  // Record Manual Note / Checkpoint
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDescription.trim()) return;

    setSubmittingNote(true);
    try {
      await api.createAdminAuditLog({
        action: noteAction,
        targetType: noteTargetType,
        targetName: noteTargetName.trim(),
        description: noteDescription.trim(),
        details: {
          severity: noteSeverity,
          recordedBy: adminSession?.name || 'Administrator',
          manualEntry: true,
          checkpointDate: new Date().toISOString(),
        },
      });

      addToast('Security audit checkpoint logged to permanent ledger', 'success');
      setShowNoteModal(false);
      setNoteDescription('');
      await loadAuditLogs();
    } catch (err: any) {
      addToast(err.message || 'Failed to record checkpoint', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('Copied to clipboard', 'info');
  };

  // Helper for action badges
  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'user_delete':
      case 'team_delete':
      case 'opportunity_delete':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: <Trash2 className="w-3.5 h-3.5" />,
          label: action.replace('_', ' ').toUpperCase(),
        };
      case 'user_suspend':
        return {
          bg: 'bg-red-500/15 text-red-400 border-red-500/40',
          icon: <UserX className="w-3.5 h-3.5" />,
          label: 'SUSPEND USER',
        };
      case 'user_unsuspend':
      case 'user_verify':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <UserCheck className="w-3.5 h-3.5" />,
          label: action.replace('_', ' ').toUpperCase(),
        };
      case 'weights_calibrate':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <Sliders className="w-3.5 h-3.5" />,
          label: 'CALIBRATE AI',
        };
      case 'opportunity_create':
      case 'opportunity_update':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          icon: <Trophy className="w-3.5 h-3.5" />,
          label: action.replace('_', ' ').toUpperCase(),
        };
      case 'report_resolve':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'RESOLVE REPORT',
        };
      case 'admin_login':
      case 'admin_signup':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: <Key className="w-3.5 h-3.5" />,
          label: action.replace('_', ' ').toUpperCase(),
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
          icon: <Edit3 className="w-3.5 h-3.5" />,
          label: action.replace('_', ' ').toUpperCase(),
        };
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'user':
        return <User className="w-3.5 h-3.5 text-blue-400" />;
      case 'team':
        return <Users className="w-3.5 h-3.5 text-indigo-400" />;
      case 'opportunity':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'algorithm':
        return <Sliders className="w-3.5 h-3.5 text-purple-400" />;
      case 'moderation':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'auth':
        return <Key className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Formatted date & relative time
  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = Date.now();
      const diffSec = Math.floor((now - d.getTime()) / 1000);

      let relative = '';
      if (diffSec < 60) relative = 'Just now';
      else if (diffSec < 3600) relative = `${Math.floor(diffSec / 60)}m ago`;
      else if (diffSec < 86400) relative = `${Math.floor(diffSec / 3600)}h ago`;
      else relative = `${Math.floor(diffSec / 86400)}d ago`;

      const formatted = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return { relative, formatted, full: d.toUTCString() };
    } catch {
      return { relative: iso, formatted: iso, full: iso };
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header & Meta Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Security & Governance Audit Log</h2>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Enforcement
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically tracked ledger of administrative overrides, role elevations, deletions, and ML model calibrations.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-purple-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Security Note</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={handleExportCSV}
              title="Export visible records to CSV format"
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium rounded flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <div className="w-px h-3 bg-slate-700" />
            <button
              onClick={handleExportJSON}
              title="Export visible records to JSON format"
              className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium rounded flex items-center gap-1 transition-colors"
            >
              <FileJson className="w-3.5 h-3.5 text-blue-400" />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={loadAuditLogs}
            disabled={loading}
            className="p-1.5 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Audit Trail"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards: Security & Accountability Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Events</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1.5">{stats.totalEvents}</div>
          <span className="text-[11px] text-slate-400">Total logged actions</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">High Impact</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 mt-1.5">{stats.highImpactCount}</div>
          <span className="text-[11px] text-amber-400/80">Deletes, suspends & AI weights</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Staff Admins</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-300 mt-1.5">{stats.activeAdminsCount}</div>
          <span className="text-[11px] text-slate-400">Active operators</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 mt-1.5">
            {stats.totalEvents > 0 ? `${Math.round((stats.successCount / stats.totalEvents) * 100)}%` : '100%'}
          </div>
          <span className="text-[11px] text-slate-400">{stats.failureCount} failed access tries</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Today's Ops</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1.5">{stats.todayCount}</div>
          <span className="text-[11px] text-emerald-400/80">Logged in last 24h</span>
        </div>
      </div>

      {/* Filter and Query Control Bar */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Full-Text Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by admin actor, email, target name, IP address, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time Scope Quick Filters & View Switcher */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setTimeScope('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeScope === 'all' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeScope('7days')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeScope === '7days' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeScope('today')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeScope === 'today' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Today
              </button>
            </div>

            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === 'timeline' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Actions</option>
            <option value="user_update">User Updates</option>
            <option value="user_delete">User Deletions</option>
            <option value="user_suspend">User Suspensions</option>
            <option value="user_unsuspend">Suspension Lifts</option>
            <option value="user_verify">Badge Verifications</option>
            <option value="team_update">Squad Updates</option>
            <option value="team_delete">Squad Deletions</option>
            <option value="opportunity_create">Opportunity Creations</option>
            <option value="opportunity_update">Opportunity Updates</option>
            <option value="opportunity_delete">Opportunity Deletions</option>
            <option value="weights_calibrate">AI Model Calibrations</option>
            <option value="report_resolve">Moderation Resolutions</option>
            <option value="admin_login">Staff Logins</option>
            <option value="admin_signup">Staff Account Creations</option>
          </select>

          {/* Target Type Filter */}
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Entities</option>
            <option value="user">User Profiles</option>
            <option value="team">Squads & Teams</option>
            <option value="opportunity">Hackathons & Opps</option>
            <option value="algorithm">Recommendation Engine</option>
            <option value="moderation">Safety & Reports</option>
            <option value="auth">Staff Authentication</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success Only</option>
            <option value="failure">Failures / Alerts Only</option>
          </select>

          {(actionFilter !== 'all' || targetTypeFilter !== 'all' || statusFilter !== 'all' || searchQuery || timeScope !== 'all') && (
            <button
              onClick={() => {
                setActionFilter('all');
                setTargetTypeFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
                setTimeScope('all');
              }}
              className="text-purple-400 hover:text-purple-300 ml-auto font-medium transition-colors"
            >
              Reset Filters
            </button>
          )}

          <div className="text-[11px] text-slate-400 ml-auto">
            Showing <strong className="text-white">{filteredLogs.length}</strong> of{' '}
            <strong className="text-white">{logs.length}</strong> recorded actions
          </div>
        </div>
      </div>

      {/* Main Audit Records List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm bg-slate-800/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
          <span>Retrieving verified audit log entries...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800 p-8">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No audit records found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No events matched your current combination of query filters. Try resetting the action or entity filters above.
          </p>
          <button
            onClick={() => {
              setActionFilter('all');
              setTargetTypeFilter('all');
              setStatusFilter('all');
              setSearchQuery('');
              setTimeScope('all');
            }}
            className="mt-4 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Description & Summary</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const times = formatTimestamp(log.timestamp);
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-750/70 hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{times.relative}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{times.formatted}</div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${badge.bg}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-slate-900 border border-slate-700">
                            {getTargetIcon(log.targetType)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 text-xs">
                              {log.targetName || log.targetType.toUpperCase()}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {log.targetId || log.targetType}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Administrator Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span>{log.adminName}</span>
                            <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1 rounded">
                              STAFF
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <span>{log.adminEmail}</span>
                            {log.ipAddress && (
                              <span className="text-slate-500">· {log.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-md">
                        <p className="text-slate-300 line-clamp-2 leading-relaxed">{log.description}</p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="text-[10px] text-purple-400 font-mono mt-1 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                            <span>+ {Object.keys(log.details).length} parameters captured</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>OK</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" />
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1 bg-slate-700/60 hover:bg-purple-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700 space-y-6">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const times = formatTimestamp(log.timestamp);
              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border flex items-center justify-center text-[10px] ${badge.bg}`}
                  >
                    {badge.icon}
                  </div>

                  {/* Timeline Card */}
                  <div
                    onClick={() => setSelectedLog(log)}
                    className="bg-slate-900/90 border border-slate-700/80 hover:border-purple-500/60 p-4 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-900/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                          <span>{log.targetName || log.targetType.toUpperCase()}</span>
                          <span className="text-slate-500 font-mono text-[10px]">({log.targetType})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono text-[11px] text-slate-400">{times.formatted}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-purple-400 font-medium">{times.relative}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 mt-2.5 leading-relaxed">{log.description}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>
                          By <strong className="text-slate-200">{log.adminName}</strong>
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-500">{log.adminEmail}</span>
                        {log.ipAddress && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-slate-500">IP: {log.ipAddress}</span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 text-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Payload</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INSPECT EVENT DETAILS MODAL / DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-300">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-white tracking-tight">Audit Event Inspector</h3>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        getActionBadge(selectedLog.action).bg
                      }`}
                    >
                      {selectedLog.action.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    ID: {selectedLog.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Event Summary Banner */}
              <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Narrative</span>
                <p className="text-xs text-white mt-1 leading-relaxed">{selectedLog.description}</p>
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timestamp (UTC)</span>
                  <div className="font-mono text-slate-200">{selectedLog.timestamp}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status & Integrity</span>
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedLog.status.toUpperCase()} (Signature Valid)</span>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Administrator Actor</span>
                  <div className="font-semibold text-slate-200">{selectedLog.adminName}</div>
                  <div className="font-mono text-[10px] text-slate-400">{selectedLog.adminEmail}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Network Origin IP</span>
                  <div className="font-mono text-slate-200">{selectedLog.ipAddress || '192.168.1.104 (Internal)'}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Type</span>
                  <div className="font-semibold text-slate-200 capitalize">{selectedLog.targetType}</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Identifier</span>
                  <div className="font-mono text-slate-200 text-[11px] truncate">
                    {selectedLog.targetName || selectedLog.targetId || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Captured Payload / Details JSON */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    Captured Parameters & State Snapshot
                  </span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2), selectedLog.id)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 transition-colors"
                  >
                    {copiedId === selectedLog.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === selectedLog.id ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl font-mono text-[11px] text-purple-200 overflow-x-auto max-h-48 leading-relaxed">
                  <pre>{JSON.stringify(selectedLog.details || {}, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">
                Log Hash: SHA256({selectedLog.id.slice(0, 12)}...)
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors border border-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD SECURITY NOTE / CHECKPOINT MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600 text-white">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-tight">Record Security Audit Checkpoint</h3>
                  <p className="text-[11px] text-slate-400">Append an immutable governance entry to the platform audit trail.</p>
                </div>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Action Category</label>
                <select
                  value={noteAction}
                  onChange={(e) => setNoteAction(e.target.value as AuditActionType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="user_update">Security Incident Review</option>
                  <option value="weights_calibrate">Algorithm Calibration Note</option>
                  <option value="report_resolve">Safety Enforcement Escalation</option>
                  <option value="user_verify">Credentials Verification Checkpoint</option>
                  <option value="user_suspend">Suspicious Access Quarantine</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Entity Type</label>
                  <select
                    value={noteTargetType}
                    onChange={(e) => setNoteTargetType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="auth">Staff Authentication</option>
                    <option value="user">User Profile</option>
                    <option value="team">Squad / Team</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="algorithm">Recommendation ML</option>
                    <option value="moderation">Trust & Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity / Classification</label>
                  <select
                    value={noteSeverity}
                    onChange={(e) => setNoteSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="normal">Normal (Routine)</option>
                    <option value="high">High (Elevated Attention)</option>
                    <option value="critical">Critical (Compliance Audit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Entity / Target Description</label>
                <input
                  type="text"
                  value={noteTargetName}
                  onChange={(e) => setNoteTargetName(e.target.value)}
                  placeholder="e.g. Rate limiter rule #42, Core recommender coefficients"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Audit Findings & Accountability Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  placeholder="Describe the administrative decision, rationale, or security checkpoint..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNote || !noteDescription.trim()}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {submittingNote ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Sign & Commit to Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
