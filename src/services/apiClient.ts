import {
  UserProfile,
  Team,
  Opportunity,
  CandidateRecommendation,
  TeamRecommendation,
  ConnectionAction,
  Conversation,
  ChatMessage,
  NotificationItem,
  ResumeExtractedData,
  AdminStats,
  ModerationReport,
  AuditLogEntry,
} from '../types/index.js';

class ApiClient {
  private baseUrl = '/api/v1';
  private token: string | null = null;

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('skillsync_token') : null;
    this.token = saved || 'Bearer usr-2';
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillsync_token', token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = this.token;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed with status ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  // --- Auth ---
  async getCurrentUser(): Promise<{ user: UserProfile; token: string }> {
    return this.request<{ user: UserProfile; token: string }>('/auth/me');
  }

  async login(email: string, password?: string): Promise<{ user: UserProfile; token: string }> {
    const data = await this.request<{ user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(params: {
    name: string;
    email: string;
    headline?: string;
    mode: 'solo' | 'team';
    lookingForSkills?: string[];
  }): Promise<{ user: UserProfile; token: string }> {
    const data = await this.request<{ user: UserProfile; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    this.setToken(data.token);
    return data;
  }

  async switchUser(userId: string): Promise<{ user: UserProfile; token: string }> {
    const data = await this.request<{ user: UserProfile; token: string }>('/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skillsync_token');
    }
  }

  // --- Users & Profiles ---
  async getUsers(params: { query?: string; skill?: string; availability?: string; goal?: string } = {}): Promise<{ users: UserProfile[]; total: number }> {
    const query = new URLSearchParams();
    if (params.query) query.set('query', params.query);
    if (params.skill) query.set('skill', params.skill);
    if (params.availability) query.set('availability', params.availability);
    if (params.goal) query.set('goal', params.goal);

    return this.request<{ users: UserProfile[]; total: number }>(`/users?${query.toString()}`);
  }

  async getUserById(id: string): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>(`/users/${id}`);
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<{ user: UserProfile; message: string }> {
    return this.request<{ user: UserProfile; message: string }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updatePrivacy(id: string, privacy: Partial<UserProfile['privacy']>): Promise<{ privacy: any; message: string }> {
    return this.request(`/users/${id}/privacy`, {
      method: 'PUT',
      body: JSON.stringify(privacy),
    });
  }

  async updatePreferences(id: string, preferences: Partial<UserProfile['preferences']>): Promise<{ preferences: any; message: string }> {
    return this.request(`/users/${id}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async deleteAccount(id: string): Promise<{ message: string }> {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // --- Skills ---
  async addSkill(userId: string, skill: { name: string; proficiency?: string; yearsOfExperience?: number }) {
    return this.request<{ skills: any[]; message: string }>(`/skills/${userId}`, {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  }

  async removeSkill(userId: string, skillId: string) {
    return this.request<{ skills: any[]; message: string }>(`/skills/${userId}/${skillId}`, {
      method: 'DELETE',
    });
  }

  // --- Projects ---
  async addProject(userId: string, project: any) {
    return this.request<{ projects: any[]; message: string }>(`/projects/${userId}`, {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async removeProject(userId: string, projectId: string) {
    return this.request<{ projects: any[]; message: string }>(`/projects/${userId}/${projectId}`, {
      method: 'DELETE',
    });
  }

  // --- Teams ---
  async getTeams(params: { query?: string; opportunityType?: string; availability?: string } = {}): Promise<{ teams: Team[]; total: number }> {
    const query = new URLSearchParams();
    if (params.query) query.set('query', params.query);
    if (params.opportunityType) query.set('opportunityType', params.opportunityType);
    if (params.availability) query.set('availability', params.availability);

    return this.request<{ teams: Team[]; total: number }>(`/teams?${query.toString()}`);
  }

  async getTeamById(id: string): Promise<{ team: Team }> {
    return this.request<{ team: Team }>(`/teams/${id}`);
  }

  async createTeam(teamData: Partial<Team>): Promise<{ team: Team; message: string }> {
    return this.request<{ team: Team; message: string }>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async addTeamRequirement(teamId: string, requirement: any) {
    return this.request<{ team: Team; newRequirement: any }>(`/teams/${teamId}/requirements`, {
      method: 'POST',
      body: JSON.stringify(requirement),
    });
  }

  async toggleTeamRequirement(teamId: string, requirementId: string) {
    return this.request<{ team: Team; reqItem: any; message: string }>(`/teams/${teamId}/requirements/${requirementId}/toggle`, {
      method: 'PUT',
    });
  }

  async inviteToTeam(teamId: string, candidateId: string, requirementId?: string, message?: string) {
    return this.request<{ success: boolean; message: string }>(`/teams/${teamId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ candidateId, requirementId, message }),
    });
  }

  // --- Opportunities ---
  async getOpportunities(params: { type?: string; query?: string } = {}): Promise<{ opportunities: Opportunity[]; total: number }> {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.query) query.set('query', params.query);

    return this.request<{ opportunities: Opportunity[]; total: number }>(`/opportunities?${query.toString()}`);
  }

  async getOpportunityById(id: string): Promise<{ opportunity: Opportunity; participants: UserProfile[]; registeredTeams: Team[] }> {
    return this.request(`/opportunities/${id}`);
  }

  async joinOpportunity(id: string): Promise<{ opportunity: Opportunity; message: string }> {
    return this.request(`/opportunities/${id}/join`, { method: 'POST' });
  }

  // --- Recommendations ---
  async getCandidateRecommendations(): Promise<{
    recommendations: CandidateRecommendation[];
    weights: any;
    userContext: any;
  }> {
    return this.request('/recommendations/candidates');
  }

  async getTeamRecommendationsForUser(): Promise<{
    recommendations: TeamRecommendation[];
    weights: any;
  }> {
    return this.request('/recommendations/teams-for-user');
  }

  async getCandidateRecommendationsForTeam(teamId: string): Promise<{
    team: Team;
    recommendations: CandidateRecommendation[];
    weights: any;
  }> {
    return this.request(`/recommendations/candidates-for-team/${teamId}`);
  }

  // --- Connections ---
  async getConnections(): Promise<{ connections: ConnectionAction[] }> {
    return this.request('/connections');
  }

  async sendConnectionRequest(targetUserId: string, message?: string): Promise<{ connection: ConnectionAction; message: string }> {
    return this.request('/connections/request', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, message }),
    });
  }

  async respondToConnection(connectionId: string, action: 'accept' | 'decline' | 'block'): Promise<{ connection: ConnectionAction; conversationId?: string; message: string }> {
    return this.request('/connections/respond', {
      method: 'POST',
      body: JSON.stringify({ connectionId, action }),
    });
  }

  // --- Messages ---
  async getConversations(): Promise<{ conversations: Conversation[] }> {
    return this.request('/messages/conversations');
  }

  async getConversationMessages(conversationId: string): Promise<{ conversation: Conversation; messages: ChatMessage[] }> {
    return this.request(`/messages/conversations/${conversationId}`);
  }

  async sendMessage(params: { conversationId?: string; targetUserId?: string; content: string }): Promise<{ message: ChatMessage }> {
    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // --- Notifications ---
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  // --- Resume Pipeline ---
  async parseResume(rawText: string, filename?: string): Promise<{ filename: string; extracted: ResumeExtractedData; message: string }> {
    return this.request('/resume/parse', {
      method: 'POST',
      body: JSON.stringify({ rawText, filename }),
    });
  }

  async confirmAndApplyResume(data: {
    confirmedSkills: any[];
    confirmedExperience: any[];
    confirmedProjects: any[];
    confirmedEducation: any[];
  }): Promise<{ user: UserProfile; message: string }> {
    return this.request('/resume/confirm-and-apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Integrations ---
  async syncGitHub(username: string): Promise<{ github: any; message: string }> {
    return this.request('/external/github/sync', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async toggleGitHubFeatured(repoId: string): Promise<{ repo: any; message: string }> {
    return this.request('/external/github/toggle-featured', {
      method: 'POST',
      body: JSON.stringify({ repoId }),
    });
  }

  async disconnectGitHub(): Promise<{ message: string }> {
    return this.request('/external/github/disconnect', { method: 'POST' });
  }

  async syncLeetCode(username: string): Promise<{ leetcode: any; message: string }> {
    return this.request('/external/leetcode/sync', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async disconnectLeetCode(): Promise<{ message: string }> {
    return this.request('/external/leetcode/disconnect', { method: 'POST' });
  }

  // --- Moderation & Reporting ---
  async submitReport(report: {
    targetType: 'user' | 'team' | 'message';
    targetId: string;
    targetName: string;
    category: string;
    reason: string;
  }): Promise<{ report: ModerationReport; message: string }> {
    return this.request('/moderation/report', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  // --- Admin Authentication & Special Editing Features ---
  async adminSignup(data: {
    name: string;
    email: string;
    adminSecretKey: string;
    headline?: string;
  }): Promise<{ adminSession: any; message: string }> {
    const res = await this.request<{ adminSession: any; message: string }>('/auth/admin-signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.adminSession?.token) {
      this.setToken(res.adminSession.token);
    }
    return res;
  }

  async adminLogin(data: {
    email?: string;
    adminSecretKey?: string;
  }): Promise<{ adminSession: any; message: string }> {
    const res = await this.request<{ adminSession: any; message: string }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.adminSession?.token) {
      this.setToken(res.adminSession.token);
    }
    return res;
  }

  async getAdminStats(): Promise<{ stats: AdminStats }> {
    return this.request('/admin/stats');
  }

  async updateAdminWeights(weights: any): Promise<{ weights: any; message: string }> {
    return this.request('/admin/weights', {
      method: 'PUT',
      body: JSON.stringify(weights),
    });
  }

  async adminUpdateUser(userId: string, updates: Partial<UserProfile>): Promise<{ user: UserProfile; message: string }> {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async adminDeleteUser(userId: string): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  async adminUpdateTeam(teamId: string, updates: Partial<Team>): Promise<{ team: Team; message: string }> {
    return this.request(`/admin/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async adminDeleteTeam(teamId: string): Promise<{ message: string }> {
    return this.request(`/admin/teams/${teamId}`, { method: 'DELETE' });
  }

  async adminCreateOpportunity(data: Partial<Opportunity>): Promise<{ opportunity: Opportunity; message: string }> {
    return this.request('/admin/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateOpportunity(oppId: string, updates: Partial<Opportunity>): Promise<{ opportunity: Opportunity; message: string }> {
    return this.request(`/admin/opportunities/${oppId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async adminDeleteOpportunity(oppId: string): Promise<{ message: string }> {
    return this.request(`/admin/opportunities/${oppId}`, { method: 'DELETE' });
  }

  async getAdminReports(): Promise<{ reports: ModerationReport[] }> {
    return this.request('/admin/reports');
  }

  async resolveAdminReport(id: string, action: string): Promise<{ report: ModerationReport; message: string }> {
    return this.request(`/admin/reports/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // --- Audit Logs ---
  async getAdminAuditLogs(params?: {
    action?: string;
    targetType?: string;
    status?: string;
    search?: string;
    limit?: number;
  }): Promise<{
    logs: AuditLogEntry[];
    totalCount: number;
    stats: {
      totalEvents: number;
      highImpactCount: number;
      activeAdminsCount: number;
      successCount: number;
      failureCount: number;
      todayCount: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.action && params.action !== 'all') query.append('action', params.action);
    if (params?.targetType && params.targetType !== 'all') query.append('targetType', params.targetType);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    return this.request(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
  }

  async createAdminAuditLog(entry: {
    action?: string;
    targetType?: string;
    description: string;
    details?: Record<string, any>;
    targetId?: string;
    targetName?: string;
    status?: 'success' | 'failure';
  }): Promise<{ log: AuditLogEntry; message: string }> {
    return this.request('/admin/audit-logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async exportAdminAuditLogs(): Promise<{
    exportedAt: string;
    totalEntries: number;
    format: string;
    logs: AuditLogEntry[];
  }> {
    return this.request('/admin/audit-logs/export', {
      method: 'POST',
    });
  }

  // --- Gemini AI Multi-Turn Chat ---
  async sendGeminiChat(params: {
    messages: Array<{ role: 'user' | 'model'; content: string }>;
    role?: 'general' | 'complex' | 'fast' | 'architect' | 'pitch';
    customModel?: string;
  }): Promise<{ reply: string; modelUsed: string; roleUsed: string }> {
    return this.request('/gemini/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const api = new ApiClient();
