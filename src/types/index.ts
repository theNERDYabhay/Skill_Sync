// Core Domain Types for SkillSync

export type UserRole = 'candidate' | 'team_lead' | 'admin';
export type UserMode = 'solo' | 'team';
export type AvailabilityStatus = 'available_now' | 'looking_for_team' | 'open_to_collab' | 'not_available';
export type CollaborationGoal = 
  | 'hackathons'
  | 'startups'
  | 'open_source'
  | 'research'
  | 'contests'
  | 'projects'
  | 'networking';

export type SkillCategory = 
  | 'Programming'
  | 'Frontend'
  | 'Backend'
  | 'Mobile'
  | 'AI/ML'
  | 'Cloud'
  | 'DevOps'
  | 'UI/UX'
  | 'Product'
  | 'Business'
  | 'Research'
  | 'Security'
  | 'Communication';

export interface UserSkill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  endorsedCount?: number;
  verified?: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  role: string;
  technologies: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  outcome?: string;
  teamMembers?: string[];
  stars?: number;
  featured?: boolean;
}

export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  htmlUrl: string;
  updatedAt: string;
  featured: boolean;
}

export interface GitHubProfileData {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
  publicReposCount?: number;
  followers?: number;
  topLanguages?: { language: string; percentage: number }[];
  featuredRepos?: GitHubRepo[];
  lastSyncedAt?: string;
}

export interface LeetCodeProfileData {
  connected: boolean;
  username?: string;
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  ranking?: number;
  contestRating?: number;
  badges?: string[];
  topLanguage?: string;
  lastSyncedAt?: string;
}

export interface UserPrivacySettings {
  profileVisibility: 'public' | 'members_only' | 'connections_only';
  resumeVisibility: boolean;
  githubVisibility: boolean;
  leetcodeVisibility: boolean;
  timelineVisibility: boolean;
  onlineStatusVisibility: boolean;
  allowDirectMessagesFrom: 'anyone' | 'connections_only';
}

export interface UserPreferences {
  emailNotifications: boolean;
  matchAlerts: boolean;
  teamInvites: boolean;
  opportunityDeadlines: boolean;
  preferredTeamSize?: string;
  preferredCommitmentHoursPerWeek?: number;
  targetOpportunityTypes?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string;
  headline: string;
  bio: string;
  location: string;
  role: UserRole;
  mode: UserMode;
  availability: AvailabilityStatus;
  commitmentHoursPerWeek: number;
  goals: CollaborationGoal[];
  skills: UserSkill[];
  lookingForSkills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  github: GitHubProfileData;
  leetcode: LeetCodeProfileData;
  privacy: UserPrivacySettings;
  preferences: UserPreferences;
  completenessScore: number;
  teamsJoinedCount: number;
  isSuspended?: boolean;
  verifiedBadge?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  adminId: string;
  name: string;
  email: string;
  role: 'admin';
  accessLevel: 'super_admin' | 'moderator';
  token: string;
}

export interface TeamMember {
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    headline: string;
  };
  role: string;
  joinedAt: string;
  isLead: boolean;
}

export interface TeamRoleRequirement {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  proficiencyNeeded: 'intermediate' | 'advanced' | 'expert';
  isFilled: boolean;
  filledByUserId?: string;
  appliedCount: number;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  logo: string;
  tagline: string;
  description: string;
  mission: string;
  projectFocus: string;
  techStack: string[];
  members: TeamMember[];
  openRequirements: TeamRoleRequirement[];
  teamSizeMax: number;
  availability: 'looking_for_members' | 'full' | 'closed';
  opportunityType: 'hackathon' | 'startup' | 'open_source' | 'contest' | 'project';
  targetOpportunityId?: string;
  githubUrl?: string;
  demoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  slug: string;
  organizer: string;
  logo: string;
  bannerUrl: string;
  type: 'hackathon' | 'contest' | 'startup' | 'open_source' | 'research';
  headline: string;
  description: string;
  prizePool?: string;
  deadline: string;
  startDate: string;
  endDate: string;
  locationType: 'remote' | 'in_person' | 'hybrid';
  locationName?: string;
  teamSizeRange: { min: number; max: number };
  requiredSkills: string[];
  eligibility: string;
  totalParticipants: number;
  participantIds: string[];
  registeredTeams: string[];
  tags: string[];
  applyUrl?: string;
}

export interface RecommendationBreakdown {
  skillComplementarity: number; // 0-100
  semanticSimilarity: number;    // 0-100
  goalCompatibility: number;     // 0-100
  projectRelevance: number;      // 0-100
  experienceRelevance: number;   // 0-100
  availabilityFit: number;       // 0-100
  overallScore: number;          // 0-100
  reasons: string[];
  missingSkillsSupplied: string[];
  complementarySkills: string[];
  sharedGoals: string[];
}

export interface CandidateRecommendation {
  user: UserProfile;
  recommendation: RecommendationBreakdown;
  recommendedForTeamId?: string;
  recommendedForRequirementId?: string;
}

export interface TeamRecommendation {
  team: Team;
  recommendation: RecommendationBreakdown;
  bestFitRole: TeamRoleRequirement;
}

export interface ConnectionAction {
  id: string;
  initiatorId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string;
  createdAt: string;
  updatedAt: string;
  initiator: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
  };
  receiver: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
  };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  readBy: string[];
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    headline: string;
    online: boolean;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 
    | 'new_match' 
    | 'connection_request' 
    | 'connection_accepted' 
    | 'team_invite' 
    | 'team_requirement_filled' 
    | 'new_message' 
    | 'opportunity_deadline' 
    | 'profile_recommendation'
    | 'github_sync';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface ResumeExtractedData {
  skills: { name: string; category: SkillCategory; confirmed: boolean }[];
  experience: { company: string; role: string; period: string; description: string; confirmed: boolean }[];
  projects: { title: string; description: string; tech: string[]; confirmed: boolean }[];
  education: { institution: string; degree: string; year: string; confirmed: boolean }[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTeams: number;
  totalMatchesGenerated: number;
  successfulConnections: number;
  teamFormationsCount: number;
  activeOpportunities: number;
  pendingReports: number;
  systemHealth: {
    apiStatus: 'healthy' | 'degraded' | 'down';
    dbLatencyMs: number;
    mlEngineLatencyMs: number;
    redisCacheHitRate: number;
    uptimeSeconds: number;
  };
  recommendationWeights: {
    skillComplementarity: number;
    semanticSimilarity: number;
    goalCompatibility: number;
    projectRelevance: number;
    experienceRelevance: number;
    availabilityFit: number;
    modelVersion: string;
  };
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetType: 'user' | 'team' | 'message';
  targetId: string;
  targetName: string;
  category: 'spam' | 'harassment' | 'impersonation' | 'fraud' | 'inappropriate_content' | 'other';
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: 'warned' | 'suspended' | 'banned' | 'content_removed' | 'none';
  createdAt: string;
  resolvedAt?: string;
}

export type AuditActionType =
  | 'user_update'
  | 'user_delete'
  | 'user_suspend'
  | 'user_unsuspend'
  | 'user_verify'
  | 'team_update'
  | 'team_delete'
  | 'opportunity_create'
  | 'opportunity_update'
  | 'opportunity_delete'
  | 'weights_calibrate'
  | 'report_resolve'
  | 'admin_login'
  | 'admin_signup';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: AuditActionType;
  targetType: 'user' | 'team' | 'opportunity' | 'algorithm' | 'moderation' | 'auth';
  targetId?: string;
  targetName?: string;
  description: string;
  details?: Record<string, any>;
  ipAddress?: string;
  status: 'success' | 'failure';
}
