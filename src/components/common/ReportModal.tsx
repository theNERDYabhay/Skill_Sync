import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { ShieldAlert, X } from 'lucide-react';

export const ReportModal: React.FC = () => {
  const { reportModalParams, closeReportModal, addToast } = useApp();
  const [category, setCategory] = useState('spam');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!reportModalParams) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitReport({
        targetType: reportModalParams.targetType,
        targetId: reportModalParams.targetId,
        targetName: reportModalParams.targetName,
        category,
        reason: reason.trim() || 'Unspecified community guideline violation',
      });
      addToast('Report submitted. Our moderation team will investigate.', 'info');
      closeReportModal();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>Report {reportModalParams.targetName}</span>
          </div>
          <button onClick={closeReportModal} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Violation Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="spam">Spam / Bot Behavior</option>
              <option value="harassment">Harassment or Unwanted Contact</option>
              <option value="impersonation">Impersonation / Fake Profile</option>
              <option value="fraud">Fraud / Scams / IP Theft</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Details & Evidence</label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide details about what occurred..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeReportModal}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
