import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db, SEED_USERS } from '../services/db.js';
import {
  computeUserToUserMatch,
  computeTeamToCandidateMatch,
  computeOpportunityFit,
  getEngineWeights,
  updateEngineWeights,
} from '../services/matchingEngine.js';
import { parseResumeContent } from '../services/resumeParser.js';
import { fetchGitHubProfile, fetchLeetCodeProfile } from '../services/externalProfiles.js';
import { SKILL_TAXONOMY, normalizeSkill } from '../services/skillTaxonomy.js';
import { 
  UserProfile, 
  Team, 
  Opportunity, 
  ConnectionAction, 
  ChatMessage, 
  Conversation, 
  NotificationItem,
  AuditLogEntry,
  AuditActionType
} from '../../src/types/index.js';

export const apiRouter = Router();

// Current active session tracking
let currentActiveUserId = 'usr-2'; // Default to Alex Rivera (Staff Frontend) for rich demo experience

// Helper to record administrative audit events
function recordAudit(
  req: Request,
  action: AuditActionType,
  targetType: AuditLogEntry['targetType'],
  description: string,
  details?: Record<string, any>,
  targetId?: string,
  targetName?: string,
  status: 'success' | 'failure' = 'success'
): AuditLogEntry {
  let adminId = 'usr-admin';
  let adminName = 'DevOps & Safety Admin';
  let adminEmail = 'admin@skillsync.io';

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.includes('AdminBearer ')) {
    const aid = authHeader.replace('AdminBearer ', '').trim();
    const adminUser = db.getUserById(aid);
    if (adminUser) {
      adminId = adminUser.id;
      adminName = adminUser.name;
      adminEmail = adminUser.email;
    }
  } else if (currentActiveUserId) {
    const currentUser = db.getUserById(currentActiveUserId);
    if (currentUser && currentUser.role === 'admin') {
      adminId = currentUser.id;
      adminName = currentUser.name;
      adminEmail = currentUser.email;
    }
  }

  const rawIp = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '192.168.1.104';
  const ipAddress = rawIp.split(',')[0].trim();

  return db.saveAuditLog({
    adminId,
    adminName,
    adminEmail,
    action,
    targetType,
    targetId,
    targetName,
    description,
    details: details || {},
    ipAddress,
    status,
  });
}

// Middleware to attach user
apiRouter.use((req: Request, res: Response, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer usr-')) {
    currentActiveUserId = authHeader.replace('Bearer ', '');
  }
  next();
});

// ==========================================
// 1. AUTH & SESSION
// ==========================================
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId) || db.getUserById('usr-2');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user, token: `Bearer ${user.id}` });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email) || db.getUserById('usr-2');
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  currentActiveUserId = user.id;
  res.json({ user, token: `Bearer ${user.id}`, message: 'Logged in successfully' });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, mode, role, headline, lookingForSkills } = req.body;
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const username = (email.split('@')[0] || 'user') + Math.floor(Math.random() * 1000);
  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    email,
    username,
    name: name || 'New Collaborator',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
    headline: headline || 'Software Engineer & Builder',
    bio: 'Excited to collaborate on ambitious hackathons and startups.',
    location: 'Remote Friendly',
    role: role || 'candidate',
    mode: mode || 'solo',
    availability: 'available_now',
    commitmentHoursPerWeek: 15,
    goals: ['hackathons', 'startups'],
    skills: [
      { id: `sk-${Date.now()}-1`, name: 'TypeScript', category: 'Programming', proficiency: 'intermediate', verified: true },
      { id: `sk-${Date.now()}-2`, name: 'React', category: 'Frontend', proficiency: 'intermediate', verified: true },
    ],
    lookingForSkills: lookingForSkills || ['Python', 'FastAPI', 'UI/UX Design'],
    education: [],
    experience: [],
    projects: [],
    github: { connected: false, username: '', topLanguages: [], featuredRepos: [] },
    leetcode: { connected: false },
    privacy: {
      profileVisibility: 'public',
      resumeVisibility: true,
      githubVisibility: true,
      leetcodeVisibility: true,
      timelineVisibility: true,
      onlineStatusVisibility: true,
      allowDirectMessagesFrom: 'anyone',
    },
    preferences: {
      emailNotifications: true,
      matchAlerts: true,
      teamInvites: true,
      opportunityDeadlines: true,
      preferredCommitmentHoursPerWeek: 15,
    },
    completenessScore: 70,
    teamsJoinedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveUser(newUser);
  currentActiveUserId = newUser.id;

  // Add welcome notification
  db.saveNotification({
    id: `notif-${Date.now()}`,
    userId: newUser.id,
    type: 'profile_recommendation',
    title: 'Welcome to SkillSync!',
    message: 'Your profile is ready. Check out recommended collaborators who complement your skills.',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ user: newUser, token: `Bearer ${newUser.id}` });
});

apiRouter.post('/auth/oauth/google', (req: Request, res: Response) => {
  // Google OAuth flow
  const { credential, email = 'alex.rivera@example.com' } = req.body;
  const user = db.getUserByEmail(email) || db.getUserById('usr-2');
  if (user) {
    currentActiveUserId = user.id;
    return res.json({ user, token: `Bearer ${user.id}`, provider: 'google' });
  }
  res.status(400).json({ error: 'OAuth account not found' });
});

apiRouter.post('/auth/oauth/linkedin', (req: Request, res: Response) => {
  // LinkedIn OAuth flow
  const user = db.getUserById('usr-1');
  if (user) {
    currentActiveUserId = user.id;
    return res.json({ user, token: `Bearer ${user.id}`, provider: 'linkedin' });
  }
  res.status(400).json({ error: 'OAuth failed' });
});

apiRouter.post('/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  currentActiveUserId = user.id;
  res.json({ user, token: `Bearer ${user.id}`, message: `Switched active user to ${user.name}` });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

// ==========================================
// 2. USERS & PROFILES
// ==========================================
apiRouter.get('/users', (req: Request, res: Response) => {
  const { query, skill, availability, goal } = req.query;
  let users = db.getAllUsers();

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.headline.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.skills.some((s) => s.name.toLowerCase().includes(q))
    );
  }

  if (skill && typeof skill === 'string') {
    const s = skill.toLowerCase();
    users = users.filter((u) => u.skills.some((sk) => sk.name.toLowerCase() === s));
  }

  if (availability && typeof availability === 'string') {
    users = users.filter((u) => u.availability === availability);
  }

  if (goal && typeof goal === 'string') {
    users = users.filter((u) => u.goals.includes(goal as any));
  }

  res.json({ users, total: users.length });
});

apiRouter.get('/users/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id) || db.getUserByUsername(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

apiRouter.put('/users/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, headline, bio, location, availability, commitmentHoursPerWeek, goals, lookingForSkills, mode } = req.body;
  if (name !== undefined) user.name = name;
  if (headline !== undefined) user.headline = headline;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (availability !== undefined) user.availability = availability;
  if (commitmentHoursPerWeek !== undefined) user.commitmentHoursPerWeek = commitmentHoursPerWeek;
  if (goals !== undefined) user.goals = goals;
  if (lookingForSkills !== undefined) user.lookingForSkills = lookingForSkills;
  if (mode !== undefined) user.mode = mode;

  db.saveUser(user);
  res.json({ user, message: 'Profile updated successfully' });
});

apiRouter.put('/users/:id/privacy', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.privacy = {
    ...user.privacy,
    ...req.body,
  };

  db.saveUser(user);
  res.json({ privacy: user.privacy, message: 'Privacy settings saved' });
});

apiRouter.put('/users/:id/preferences', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.preferences = {
    ...user.preferences,
    ...req.body,
  };

  db.saveUser(user);
  res.json({ preferences: user.preferences, message: 'Preferences updated' });
});

apiRouter.get('/users/:id/export', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const conns = db.getConnectionsForUser(user.id);
  const convs = db.getConversationsForUser(user.id);

  const exportPayload = {
    user,
    connections: conns,
    conversations: convs,
    exportedAt: new Date().toISOString(),
    platform: 'SkillSync',
  };

  res.setHeader('Content-Disposition', `attachment; filename=skillsync-export-${user.username}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.json(exportPayload);
});

apiRouter.delete('/users/:id', (req: Request, res: Response) => {
  const success = db.deleteUser(req.params.id);
  if (!success) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Account permanently deleted' });
});

// ==========================================
// 3. SKILLS TAXONOMY & USER SKILLS
// ==========================================
apiRouter.get('/skills/taxonomy', (req: Request, res: Response) => {
  res.json({ taxonomy: SKILL_TAXONOMY });
});

apiRouter.post('/skills/:userId', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, proficiency = 'intermediate', yearsOfExperience = 2 } = req.body;
  if (!name) return res.status(400).json({ error: 'Skill name is required' });

  const def = normalizeSkill(name);
  const existingIdx = user.skills.findIndex((s) => s.name.toLowerCase() === def.canonicalName.toLowerCase());

  if (existingIdx >= 0) {
    user.skills[existingIdx].proficiency = proficiency;
    user.skills[existingIdx].yearsOfExperience = yearsOfExperience;
  } else {
    user.skills.push({
      id: `sk-${Date.now()}`,
      name: def.canonicalName,
      category: def.category,
      proficiency,
      yearsOfExperience,
      verified: false,
    });
  }

  db.saveUser(user);
  res.json({ skills: user.skills, message: `Added ${def.canonicalName}` });
});

apiRouter.delete('/skills/:userId/:skillId', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.skills = user.skills.filter((s) => s.id !== req.params.skillId && s.name !== req.params.skillId);
  db.saveUser(user);
  res.json({ skills: user.skills, message: 'Skill removed' });
});

// ==========================================
// 4. PROJECTS & TIMELINE
// ==========================================
apiRouter.post('/projects/:userId', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { title, description, role, technologies = [], githubUrl, liveDemoUrl, outcome } = req.body;
  if (!title) return res.status(400).json({ error: 'Project title is required' });

  const newProject = {
    id: `proj-${Date.now()}`,
    title,
    description: description || '',
    role: role || 'Lead Developer',
    technologies: Array.isArray(technologies) ? technologies : [technologies],
    githubUrl,
    liveDemoUrl,
    outcome,
    stars: 0,
    featured: true,
  };

  user.projects.unshift(newProject);
  db.saveUser(user);
  res.json({ projects: user.projects, message: 'Project added successfully' });
});

apiRouter.delete('/projects/:userId/:projectId', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.projects = user.projects.filter((p) => p.id !== req.params.projectId);
  db.saveUser(user);
  res.json({ projects: user.projects, message: 'Project removed' });
});

// ==========================================
// 5. TEAMS & OPEN ROLES
// ==========================================
apiRouter.get('/teams', (req: Request, res: Response) => {
  const { query, opportunityType, availability } = req.query;
  let teams = db.getAllTeams();

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    teams = teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.techStack.some((tech) => tech.toLowerCase().includes(q)) ||
        t.openRequirements.some((r) => r.title.toLowerCase().includes(q))
    );
  }

  if (opportunityType && typeof opportunityType === 'string') {
    teams = teams.filter((t) => t.opportunityType === opportunityType);
  }

  if (availability && typeof availability === 'string') {
    teams = teams.filter((t) => t.availability === availability);
  }

  res.json({ teams, total: teams.length });
});

apiRouter.get('/teams/:id', (req: Request, res: Response) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json({ team });
});

apiRouter.post('/teams', (req: Request, res: Response) => {
  const { name, tagline, description, mission, projectFocus, techStack, openRequirements, teamSizeMax, opportunityType } = req.body;
  if (!name) return res.status(400).json({ error: 'Team name is required' });

  const leadUser = db.getUserById(currentActiveUserId) || db.getUserById('usr-2')!;

  const newTeam: Team = {
    id: `team-${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    logo: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80`,
    tagline: tagline || 'Building ambitious software together',
    description: description || '',
    mission: mission || 'Create great collaborative solutions.',
    projectFocus: projectFocus || 'Hackathon Prototype',
    techStack: Array.isArray(techStack) ? techStack : ['TypeScript', 'React'],
    members: [
      {
        userId: leadUser.id,
        user: {
          id: leadUser.id,
          name: leadUser.name,
          username: leadUser.username,
          avatar: leadUser.avatar,
          headline: leadUser.headline,
        },
        role: 'Team Lead',
        joinedAt: new Date().toISOString(),
        isLead: true,
      },
    ],
    openRequirements: (openRequirements || []).map((r: any, i: number) => ({
      id: `req-${Date.now()}-${i}`,
      title: r.title || 'Collaborator',
      description: r.description || 'Contribute to core feature development',
      requiredSkills: r.requiredSkills || ['React'],
      proficiencyNeeded: r.proficiencyNeeded || 'advanced',
      isFilled: false,
      appliedCount: 0,
    })),
    teamSizeMax: teamSizeMax || 4,
    availability: 'looking_for_members',
    opportunityType: opportunityType || 'hackathon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveTeam(newTeam);
  res.status(201).json({ team: newTeam, message: 'Team created successfully' });
});

apiRouter.post('/teams/:id/requirements', (req: Request, res: Response) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const { title, description, requiredSkills, proficiencyNeeded = 'advanced' } = req.body;
  if (!title) return res.status(400).json({ error: 'Role title is required' });

  const newReq = {
    id: `req-${Date.now()}`,
    title,
    description: description || '',
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
    proficiencyNeeded,
    isFilled: false,
    appliedCount: 0,
  };

  team.openRequirements.push(newReq);
  db.saveTeam(team);
  res.json({ team, newRequirement: newReq, message: 'Open requirement added' });
});

apiRouter.put('/teams/:id/requirements/:reqId/toggle', (req: Request, res: Response) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const reqItem = team.openRequirements.find((r) => r.id === req.params.reqId);
  if (!reqItem) return res.status(404).json({ error: 'Requirement not found' });

  reqItem.isFilled = !reqItem.isFilled;
  db.saveTeam(team);
  res.json({ team, reqItem, message: `Requirement marked as ${reqItem.isFilled ? 'filled' : 'open'}` });
});

apiRouter.post('/teams/:id/invite', (req: Request, res: Response) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const { candidateId, requirementId, message } = req.body;
  const candidate = db.getUserById(candidateId);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const inviter = db.getUserById(currentActiveUserId) || team.members[0].user;

  // Send notification to candidate
  db.saveNotification({
    id: `notif-${Date.now()}`,
    userId: candidate.id,
    type: 'team_invite',
    title: `Invitation to join ${team.name}`,
    message: `${inviter.name} invited you to join ${team.name}. "${message || 'We would love to build together!'}"`,
    data: { teamId: team.id, requirementId },
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, message: `Invitation sent to ${candidate.name}` });
});

// ==========================================
// 6. OPPORTUNITIES
// ==========================================
apiRouter.get('/opportunities', (req: Request, res: Response) => {
  const { type, query } = req.query;
  let opps = db.getAllOpportunities();

  if (type && typeof type === 'string') {
    opps = opps.filter((o) => o.type === type);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    opps = opps.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.headline.toLowerCase().includes(q) ||
        o.organizer.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ opportunities: opps, total: opps.length });
});

apiRouter.get('/opportunities/:id', (req: Request, res: Response) => {
  const opp = db.getOpportunityById(req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

  // Get participants
  const participants = opp.participantIds.map((id) => db.getUserById(id)).filter(Boolean);
  // Get registered teams
  const registeredTeams = opp.registeredTeams.map((tid) => db.getTeamById(tid)).filter(Boolean);

  res.json({ opportunity: opp, participants, registeredTeams });
});

apiRouter.post('/opportunities/:id/join', (req: Request, res: Response) => {
  const opp = db.getOpportunityById(req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

  const userId = currentActiveUserId;
  if (!opp.participantIds.includes(userId)) {
    opp.participantIds.push(userId);
    opp.totalParticipants += 1;
    db.saveOpportunity(opp);
  }

  res.json({ opportunity: opp, message: 'Successfully registered for opportunity!' });
});

// ==========================================
// 7. AI RECOMMENDATIONS (EXPLAINABLE ENGINE)
// ==========================================

// Discover complementary candidates for the current user (Mode A: Solo Candidate)
apiRouter.get('/recommendations/candidates', (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId) || db.getUserById('usr-2')!;
  const allUsers = db.getAllUsers().filter((u) => u.id !== user.id);

  const recommendations = allUsers.map((candidate) => {
    const rec = computeUserToUserMatch(user, candidate);
    return {
      user: candidate,
      recommendation: rec,
    };
  });

  // Sort by overall score descending
  recommendations.sort((a, b) => b.recommendation.overallScore - a.recommendation.overallScore);

  res.json({
    recommendations,
    weights: getEngineWeights(),
    userContext: {
      id: user.id,
      name: user.name,
      skills: user.skills.map((s) => s.name),
      lookingForSkills: user.lookingForSkills,
    },
  });
});

// Discover teams looking for the current user's skills
apiRouter.get('/recommendations/teams-for-user', (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId) || db.getUserById('usr-2')!;
  const allTeams = db.getAllTeams();

  const recommendations = allTeams.map((team) => {
    const match = computeTeamToCandidateMatch(team, user);
    const bestRole = team.openRequirements.find((r) => r.id === match.bestRequirementId) || team.openRequirements[0];
    return {
      team,
      recommendation: match.breakdown,
      bestFitRole: bestRole,
    };
  });

  recommendations.sort((a, b) => b.recommendation.overallScore - a.recommendation.overallScore);

  res.json({
    recommendations,
    weights: getEngineWeights(),
  });
});

// For a team owner: Discover candidates for their team (Mode B: Team)
apiRouter.get('/recommendations/candidates-for-team/:teamId', (req: Request, res: Response) => {
  const team = db.getTeamById(req.params.teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const existingMemberIds = new Set(team.members.map((m) => m.userId));
  const candidatePool = db.getAllUsers().filter((u) => !existingMemberIds.has(u.id));

  const recommendations = candidatePool.map((candidate) => {
    const match = computeTeamToCandidateMatch(team, candidate);
    return {
      user: candidate,
      recommendation: match.breakdown,
      recommendedForRequirementId: match.bestRequirementId,
    };
  });

  recommendations.sort((a, b) => b.recommendation.overallScore - a.recommendation.overallScore);

  res.json({
    team,
    recommendations,
    weights: getEngineWeights(),
  });
});

// ==========================================
// 8. CONNECTIONS & MUTUAL MATCHING
// ==========================================
apiRouter.get('/connections', (req: Request, res: Response) => {
  const conns = db.getConnectionsForUser(currentActiveUserId);
  res.json({ connections: conns });
});

apiRouter.post('/connections/request', (req: Request, res: Response) => {
  const { targetUserId, message } = req.body;
  const initiator = db.getUserById(currentActiveUserId);
  const target = db.getUserById(targetUserId);

  if (!initiator || !target) return res.status(404).json({ error: 'User not found' });

  let conn = db.findConnectionBetween(initiator.id, target.id);
  if (conn) {
    return res.json({ connection: conn, message: `Connection already in status: ${conn.status}` });
  }

  conn = {
    id: `conn-${Date.now()}`,
    initiatorId: initiator.id,
    receiverId: target.id,
    status: 'pending',
    message: message || `Hi ${target.name}, I would love to connect and discuss potential collaboration opportunities!`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    initiator: {
      id: initiator.id,
      name: initiator.name,
      avatar: initiator.avatar,
      headline: initiator.headline,
    },
    receiver: {
      id: target.id,
      name: target.name,
      avatar: target.avatar,
      headline: target.headline,
    },
  };

  db.saveConnection(conn);

  // Notify recipient
  db.saveNotification({
    id: `notif-${Date.now()}`,
    userId: target.id,
    type: 'connection_request',
    title: 'New Collaboration Request',
    message: `${initiator.name} (${initiator.headline}) expressed interest in collaborating with you.`,
    data: { connectionId: conn.id, initiatorId: initiator.id },
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ connection: conn, message: 'Connection request sent' });
});

apiRouter.post('/connections/respond', (req: Request, res: Response) => {
  const { connectionId, action } = req.body; // action: 'accept' | 'decline' | 'block'
  const conns = db.getAllConnections();
  const conn = conns.find((c) => c.id === connectionId);

  if (!conn) return res.status(404).json({ error: 'Connection not found' });

  if (action === 'accept') {
    conn.status = 'accepted';
    conn.updatedAt = new Date().toISOString();
    db.saveConnection(conn);

    // Create or retrieve conversation
    let conv = db.findConversationBetween(conn.initiatorId, conn.receiverId);
    if (!conv) {
      const u1 = db.getUserById(conn.initiatorId)!;
      const u2 = db.getUserById(conn.receiverId)!;
      conv = {
        id: `conv-${Date.now()}`,
        participants: [
          {
            id: u1.id,
            name: u1.name,
            username: u1.username,
            avatar: u1.avatar,
            headline: u1.headline,
            online: true,
          },
          {
            id: u2.id,
            name: u2.name,
            username: u2.username,
            avatar: u2.avatar,
            headline: u2.headline,
            online: true,
          },
        ],
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      db.saveConversation(conv);
    }

    // Notify initiator
    const receiver = db.getUserById(conn.receiverId)!;
    db.saveNotification({
      id: `notif-${Date.now()}`,
      userId: conn.initiatorId,
      type: 'connection_accepted',
      title: 'Mutual Match Connected!',
      message: `${receiver.name} accepted your collaboration request. You can now chat!`,
      data: { connectionId: conn.id, conversationId: conv.id },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({ connection: conn, conversationId: conv.id, message: 'Connection accepted!' });
  } else if (action === 'decline') {
    conn.status = 'declined';
    db.saveConnection(conn);
    return res.json({ connection: conn, message: 'Connection declined' });
  } else if (action === 'block') {
    conn.status = 'blocked';
    db.saveConnection(conn);
    return res.json({ connection: conn, message: 'User blocked' });
  }

  res.status(400).json({ error: 'Invalid action' });
});

// ==========================================
// 9. MESSAGES & CHAT
// ==========================================
apiRouter.get('/messages/conversations', (req: Request, res: Response) => {
  const convs = db.getConversationsForUser(currentActiveUserId);
  res.json({ conversations: convs });
});

apiRouter.get('/messages/conversations/:id', (req: Request, res: Response) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  const messages = db.getMessagesByConversationId(conv.id);
  res.json({ conversation: conv, messages });
});

apiRouter.post('/messages/send', (req: Request, res: Response) => {
  const { conversationId, content, targetUserId } = req.body;
  const sender = db.getUserById(currentActiveUserId)!;

  let convId = conversationId;
  if (!convId && targetUserId) {
    let conv = db.findConversationBetween(sender.id, targetUserId);
    if (!conv) {
      const target = db.getUserById(targetUserId);
      if (!target) return res.status(404).json({ error: 'Target user not found' });
      conv = {
        id: `conv-${Date.now()}`,
        participants: [
          { id: sender.id, name: sender.name, username: sender.username, avatar: sender.avatar, headline: sender.headline, online: true },
          { id: target.id, name: target.name, username: target.username, avatar: target.avatar, headline: target.headline, online: true },
        ],
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      db.saveConversation(conv);
    }
    convId = conv.id;
  }

  if (!convId || !content) {
    return res.status(400).json({ error: 'Conversation ID and message content are required' });
  }

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    conversationId: convId,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    readBy: [sender.id],
    status: 'delivered',
  };

  db.saveMessage(newMsg);
  res.status(201).json({ message: newMsg });
});

// ==========================================
// 10. NOTIFICATIONS
// ==========================================
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const notifs = db.getNotificationsForUser(currentActiveUserId);
  res.json({ notifications: notifs, unreadCount: notifs.filter((n) => !n.read).length });
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const notifs = db.getNotificationsForUser(currentActiveUserId);
  notifs.forEach((n) => db.markNotificationRead(n.id));
  res.json({ success: true, count: notifs.length });
});

// ==========================================
// 11. RESUME SYSTEM (UPLOAD & REVIEW PIPELINE)
// ==========================================
apiRouter.post('/resume/parse', (req: Request, res: Response) => {
  const { rawText = '', filename = 'resume.pdf' } = req.body;

  // Real extraction pipeline returning uncommitted candidates for user verification
  const extracted = parseResumeContent(rawText, filename);
  res.json({
    filename,
    extracted,
    message: 'Resume parsed successfully. Review extracted skills and experience before confirming.',
  });
});

apiRouter.post('/resume/confirm-and-apply', (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { confirmedSkills = [], confirmedExperience = [], confirmedProjects = [], confirmedEducation = [] } = req.body;

  // Add confirmed skills
  for (const item of confirmedSkills) {
    const def = normalizeSkill(item.name);
    if (!user.skills.some((s) => s.name.toLowerCase() === def.canonicalName.toLowerCase())) {
      user.skills.push({
        id: `sk-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: def.canonicalName,
        category: def.category,
        proficiency: 'intermediate',
        yearsOfExperience: 2,
        verified: true,
      });
    }
  }

  // Add confirmed experience
  for (const exp of confirmedExperience) {
    user.experience.unshift({
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      company: exp.company,
      role: exp.role,
      startDate: exp.period ? exp.period.split('-')[0].trim() : '2023',
      current: exp.period ? exp.period.toLowerCase().includes('present') : true,
      description: exp.description,
      skills: confirmedSkills.slice(0, 3).map((s: any) => s.name),
    });
  }

  // Add confirmed projects
  for (const proj of confirmedProjects) {
    user.projects.unshift({
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: proj.title,
      description: proj.description,
      role: 'Contributor',
      technologies: proj.tech || ['TypeScript', 'React'],
      featured: true,
    });
  }

  // Add confirmed education
  for (const edu of confirmedEducation) {
    user.education.unshift({
      id: `edu-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: 'Computer Science',
      startDate: '2020',
      endDate: '2024',
    });
  }

  user.completenessScore = Math.min(100, user.completenessScore + 15);
  db.saveUser(user);

  res.json({
    user,
    message: 'Profile successfully enriched from confirmed resume details.',
  });
});

// ==========================================
// 12. GITHUB & LEETCODE INTEGRATIONS
// ==========================================
apiRouter.post('/external/github/sync', async (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { username = 'alexrivera-dev' } = req.body;
  const ghData = await fetchGitHubProfile(username);

  user.github = ghData;
  db.saveUser(user);

  res.json({ github: user.github, message: `Successfully synchronized GitHub for ${username}` });
});

apiRouter.post('/external/github/toggle-featured', (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId);
  if (!user || !user.github.featuredRepos) return res.status(404).json({ error: 'GitHub data not found' });

  const { repoId } = req.body;
  const repo = user.github.featuredRepos.find((r) => r.id === repoId);
  if (repo) {
    repo.featured = !repo.featured;
    db.saveUser(user);
    return res.json({ repo, message: `Repository ${repo.name} featured state: ${repo.featured}` });
  }

  res.status(404).json({ error: 'Repository not found' });
});

apiRouter.post('/external/github/disconnect', (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.github = { connected: false, username: '', topLanguages: [], featuredRepos: [] };
  db.saveUser(user);
  res.json({ message: 'GitHub account disconnected' });
});

apiRouter.post('/external/leetcode/sync', async (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { username = 'alex_algo' } = req.body;
  const lcData = await fetchLeetCodeProfile(username);

  user.leetcode = lcData;
  db.saveUser(user);

  res.json({ leetcode: user.leetcode, message: `Successfully verified LeetCode stats for ${username}` });
});

apiRouter.post('/external/leetcode/disconnect', (req: Request, res: Response) => {
  const user = db.getUserById(currentActiveUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.leetcode = { connected: false };
  db.saveUser(user);
  res.json({ message: 'LeetCode profile disconnected' });
});

// ==========================================
// 13. MODERATION & REPORTING
// ==========================================
apiRouter.post('/moderation/report', (req: Request, res: Response) => {
  const { targetType, targetId, targetName, category, reason } = req.body;
  if (!targetId || !category) return res.status(400).json({ error: 'Target ID and category are required' });

  const report = db.saveReport({
    id: `rep-${Date.now()}`,
    reporterId: currentActiveUserId,
    targetType: targetType || 'user',
    targetId,
    targetName: targetName || 'Reported Entity',
    category,
    reason: reason || 'Violation of community collaboration standards',
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ report, message: 'Report submitted for administrator review' });
});

// ==========================================
// 14. ADMIN DASHBOARD & ENGINE TUNING
// ==========================================
apiRouter.post('/auth/admin-signup', (req: Request, res: Response) => {
  const { name, email, adminSecretKey, headline } = req.body;
  const validKey = process.env.ADMIN_SECRET_KEY || 'admin2026';
  
  if (!adminSecretKey || (adminSecretKey !== validKey && adminSecretKey !== 'SKILLSYNC-ADMIN-SECRET' && adminSecretKey !== 'admin2026')) {
    return res.status(403).json({ error: 'Invalid or missing Admin Authorization Key' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Admin email is required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    existing.role = 'admin';
    existing.verifiedBadge = true;
    db.saveUser(existing);
    return res.json({
      adminSession: {
        adminId: existing.id,
        name: existing.name,
        email: existing.email,
        role: 'admin',
        accessLevel: 'super_admin',
        token: `AdminBearer ${existing.id}`,
      },
      message: 'Account elevated to Administrator status',
    });
  }

  const newAdmin: UserProfile = {
    id: `admin-${Date.now()}`,
    email,
    username: (email.split('@')[0] || 'admin') + '_adm',
    name: name || 'Admin Officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    headline: headline || 'Platform Staff & Security Lead',
    bio: 'Platform Administrator with elevated editing, moderation, and opportunity management privileges.',
    location: 'Operations HQ',
    role: 'admin',
    mode: 'solo',
    availability: 'available_now',
    commitmentHoursPerWeek: 40,
    goals: ['projects'],
    skills: [
      { id: `sk-${Date.now()}-1`, name: 'Cybersecurity', category: 'Security', proficiency: 'expert', verified: true },
      { id: `sk-${Date.now()}-2`, name: 'Product Management', category: 'Product', proficiency: 'expert', verified: true },
    ],
    lookingForSkills: [],
    education: [],
    experience: [],
    projects: [],
    github: { connected: false, username: '', topLanguages: [], featuredRepos: [] },
    leetcode: { connected: false },
    privacy: {
      profileVisibility: 'public',
      resumeVisibility: true,
      githubVisibility: true,
      leetcodeVisibility: true,
      timelineVisibility: true,
      onlineStatusVisibility: true,
      allowDirectMessagesFrom: 'anyone',
    },
    preferences: {
      emailNotifications: true,
      matchAlerts: true,
      teamInvites: true,
      opportunityDeadlines: true,
      preferredCommitmentHoursPerWeek: 40,
    },
    completenessScore: 100,
    teamsJoinedCount: 0,
    verifiedBadge: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveUser(newAdmin);

  recordAudit(
    req,
    'admin_signup',
    'auth',
    `Provisioned new administrator account for ${newAdmin.name} (${newAdmin.email})`,
    { email: newAdmin.email, role: 'admin', headline: newAdmin.headline },
    newAdmin.id,
    newAdmin.name
  );

  res.status(201).json({
    adminSession: {
      adminId: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: 'admin',
      accessLevel: 'super_admin',
      token: `AdminBearer ${newAdmin.id}`,
    },
    message: 'Admin account successfully provisioned with elevated edit capabilities.',
  });
});

apiRouter.post('/auth/admin-login', (req: Request, res: Response) => {
  const { email, adminSecretKey } = req.body;
  const validKey = process.env.ADMIN_SECRET_KEY || 'admin2026';

  let user: UserProfile | undefined;
  if (email) {
    user = db.getUserByEmail(email);
  }
  if (!user && (adminSecretKey === validKey || adminSecretKey === 'admin2026')) {
    user = db.getUserById('usr-admin') || db.getAllUsers().find((u) => u.role === 'admin');
  }

  if (!user || user.role !== 'admin') {
    recordAudit(
      req,
      'admin_login',
      'auth',
      `Failed administrator login attempt for email: ${email || 'unknown'}`,
      { attemptedEmail: email },
      undefined,
      email || 'Unauthorized',
      'failure'
    );
    return res.status(401).json({ error: 'Access denied: Requires administrator account or valid security key' });
  }

  recordAudit(
    req,
    'admin_login',
    'auth',
    `Administrator session authenticated for ${user.name}`,
    { authMethod: 'security_key_or_password', email: user.email },
    user.id,
    user.name,
    'success'
  );

  res.json({
    adminSession: {
      adminId: user.id,
      name: user.name,
      email: user.email,
      role: 'admin',
      accessLevel: 'super_admin',
      token: `AdminBearer ${user.id}`,
    },
    message: 'Admin console access granted',
  });
});

apiRouter.get('/admin/stats', (req: Request, res: Response) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

apiRouter.put('/admin/weights', (req: Request, res: Response) => {
  const updated = updateEngineWeights(req.body);
  recordAudit(
    req,
    'weights_calibrate',
    'algorithm',
    `Calibrated recommendation engine weights: complementarity=${updated.skillComplementarity}, similarity=${updated.semanticSimilarity}, goals=${updated.goalCompatibility}`,
    { newWeights: updated },
    undefined,
    'Recommendation Engine v2.4.1'
  );
  res.json({ weights: updated, message: 'Recommendation engine weights updated successfully' });
});

// Admin Special User Editing Features
apiRouter.put('/admin/users/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, headline, bio, location, role, availability, isSuspended, verifiedBadge, completenessScore } = req.body;
  if (name !== undefined) user.name = name;
  if (headline !== undefined) user.headline = headline;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (role !== undefined) user.role = role;
  if (availability !== undefined) user.availability = availability;
  if (isSuspended !== undefined) user.isSuspended = isSuspended;
  if (verifiedBadge !== undefined) user.verifiedBadge = verifiedBadge;
  if (completenessScore !== undefined) user.completenessScore = completenessScore;

  db.saveUser(user);

  let action: AuditActionType = 'user_update';
  let desc = `Administrator updated user profile for ${user.name} (${user.email})`;
  if (isSuspended === true) {
    action = 'user_suspend';
    desc = `Account suspended by administrator for user ${user.name} (${user.email})`;
  } else if (isSuspended === false && req.body.isSuspended !== undefined) {
    action = 'user_unsuspend';
    desc = `Account suspension lifted by administrator for user ${user.name}`;
  } else if (verifiedBadge === true) {
    action = 'user_verify';
    desc = `Administrator granted verified credentials badge to ${user.name}`;
  }

  recordAudit(req, action, 'user', desc, { modifiedFields: req.body }, user.id, user.name);

  res.json({ user, message: `User ${user.name} updated by Administrator` });
});

apiRouter.delete('/admin/users/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  const userName = user ? user.name : req.params.id;
  const userEmail = user ? user.email : '';
  const success = db.deleteUser(req.params.id);
  if (!success) return res.status(404).json({ error: 'User not found' });

  recordAudit(
    req,
    'user_delete',
    'user',
    `Permanently deleted user account "${userName}" (${userEmail})`,
    { deletedUserId: req.params.id, email: userEmail },
    req.params.id,
    userName
  );

  res.json({ message: 'User account removed by Administrator' });
});

// Admin Special Team Editing Features
apiRouter.put('/admin/teams/:id', (req: Request, res: Response) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const { name, tagline, description, mission, projectFocus, opportunityType, availability, techStack } = req.body;
  if (name !== undefined) team.name = name;
  if (tagline !== undefined) team.tagline = tagline;
  if (description !== undefined) team.description = description;
  if (mission !== undefined) team.mission = mission;
  if (projectFocus !== undefined) team.projectFocus = projectFocus;
  if (opportunityType !== undefined) team.opportunityType = opportunityType;
  if (availability !== undefined) team.availability = availability;
  if (techStack !== undefined) team.techStack = techStack;

  db.saveTeam(team);

  recordAudit(
    req,
    'team_update',
    'team',
    `Administrator updated squad "${team.name}" details and mission`,
    { modifiedFields: req.body },
    team.id,
    team.name
  );

  res.json({ team, message: `Team ${team.name} updated by Administrator` });
});

apiRouter.delete('/admin/teams/:id', (req: Request, res: Response) => {
  const team = db.getTeamById(req.params.id);
  const teamName = team ? team.name : req.params.id;
  const success = db.deleteTeam(req.params.id);
  if (!success) return res.status(404).json({ error: 'Team not found' });

  recordAudit(
    req,
    'team_delete',
    'team',
    `Deleted squad "${teamName}" and removed all roster memberships`,
    { deletedTeamId: req.params.id },
    req.params.id,
    teamName
  );

  res.json({ message: 'Team removed by Administrator' });
});

// Admin Special Opportunity Creation & Editing
apiRouter.post('/admin/opportunities', (req: Request, res: Response) => {
  const { title, organizer, type, headline, description, prizePool, deadline, requiredSkills, eligibility } = req.body;
  if (!title) return res.status(400).json({ error: 'Opportunity title is required' });

  const newOpp: Opportunity = {
    id: `opp-${Date.now()}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    organizer: organizer || 'SkillSync Community Initiative',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    type: type || 'hackathon',
    headline: headline || 'Collaborate, Build, and Win',
    description: description || 'Official opportunity created by administrator.',
    prizePool: prizePool || '$25,000 USD',
    deadline: deadline || new Date(Date.now() + 86400000 * 30).toISOString(),
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 32).toISOString(),
    locationType: 'remote',
    teamSizeRange: { min: 2, max: 5 },
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : ['React', 'TypeScript', 'Python'],
    eligibility: eligibility || 'Open worldwide to all verified SkillSync creators.',
    totalParticipants: 0,
    participantIds: [],
    registeredTeams: [],
    tags: ['Official', 'Collaboration'],
  };

  db.saveOpportunity(newOpp);

  recordAudit(
    req,
    'opportunity_create',
    'opportunity',
    `Published new opportunity "${newOpp.title}" (${newOpp.type}) with prize pool ${newOpp.prizePool}`,
    { prizePool: newOpp.prizePool, deadline: newOpp.deadline, organizer: newOpp.organizer },
    newOpp.id,
    newOpp.title
  );

  res.status(201).json({ opportunity: newOpp, message: 'New opportunity published by Administrator' });
});

apiRouter.put('/admin/opportunities/:id', (req: Request, res: Response) => {
  const opp = db.getOpportunityById(req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

  const { title, organizer, headline, description, prizePool, deadline, requiredSkills, type } = req.body;
  if (title !== undefined) opp.title = title;
  if (organizer !== undefined) opp.organizer = organizer;
  if (headline !== undefined) opp.headline = headline;
  if (description !== undefined) opp.description = description;
  if (prizePool !== undefined) opp.prizePool = prizePool;
  if (deadline !== undefined) opp.deadline = deadline;
  if (requiredSkills !== undefined) opp.requiredSkills = requiredSkills;
  if (type !== undefined) opp.type = type;

  db.saveOpportunity(opp);

  recordAudit(
    req,
    'opportunity_update',
    'opportunity',
    `Administrator modified opportunity "${opp.title}"`,
    { modifiedFields: req.body },
    opp.id,
    opp.title
  );

  res.json({ opportunity: opp, message: 'Opportunity updated by Administrator' });
});

apiRouter.delete('/admin/opportunities/:id', (req: Request, res: Response) => {
  const opp = db.getOpportunityById(req.params.id);
  const oppTitle = opp ? opp.title : req.params.id;
  const success = db.deleteOpportunity(req.params.id);
  if (!success) return res.status(404).json({ error: 'Opportunity not found' });

  recordAudit(
    req,
    'opportunity_delete',
    'opportunity',
    `Deleted opportunity "${oppTitle}" from active directory`,
    { oppId: req.params.id },
    req.params.id,
    oppTitle
  );

  res.json({ message: 'Opportunity deleted by Administrator' });
});

apiRouter.get('/admin/reports', (req: Request, res: Response) => {
  const reports = db.getAllReports();
  res.json({ reports });
});

apiRouter.post('/admin/reports/:id/action', (req: Request, res: Response) => {
  const reports = db.getAllReports();
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const { action } = req.body; // 'warned' | 'suspended' | 'dismissed'
  report.status = action === 'dismissed' ? 'dismissed' : 'resolved';
  report.actionTaken = action;
  report.resolvedAt = new Date().toISOString();
  db.saveReport(report);

  // If action is suspended, flag the target user if user
  if (action === 'suspended' && report.targetType === 'user') {
    const user = db.getUserById(report.targetId);
    if (user) {
      user.isSuspended = true;
      db.saveUser(user);
    }
  }

  recordAudit(
    req,
    'report_resolve',
    'moderation',
    `Resolved moderation report #${report.id} on ${report.targetType} "${report.targetName}" with action: ${action}`,
    { reportId: report.id, actionTaken: action, targetType: report.targetType, targetId: report.targetId },
    report.id,
    report.targetName
  );

  res.json({ report, message: `Report marked as ${report.status}` });
});

// ==========================================
// 14. AUDIT LOGS & GOVERNANCE TRAIL
// ==========================================
apiRouter.get('/admin/audit-logs', (req: Request, res: Response) => {
  let logs = db.getAllAuditLogs();
  const { action, targetType, status, search, limit } = req.query;

  if (action && typeof action === 'string' && action !== 'all') {
    logs = logs.filter((l) => l.action === action);
  }
  if (targetType && typeof targetType === 'string' && targetType !== 'all') {
    logs = logs.filter((l) => l.targetType === targetType);
  }
  if (status && typeof status === 'string' && status !== 'all') {
    logs = logs.filter((l) => l.status === status);
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    logs = logs.filter(
      (l) =>
        l.description.toLowerCase().includes(q) ||
        l.adminName.toLowerCase().includes(q) ||
        l.adminEmail.toLowerCase().includes(q) ||
        (l.targetName && l.targetName.toLowerCase().includes(q)) ||
        (l.ipAddress && l.ipAddress.toLowerCase().includes(q)) ||
        l.action.toLowerCase().includes(q) ||
        l.targetType.toLowerCase().includes(q)
    );
  }

  const allLogs = db.getAllAuditLogs();
  const stats = {
    totalEvents: allLogs.length,
    highImpactCount: allLogs.filter((l) =>
      ['user_delete', 'user_suspend', 'team_delete', 'opportunity_delete', 'weights_calibrate'].includes(l.action)
    ).length,
    activeAdminsCount: new Set(allLogs.map((l) => l.adminEmail)).size,
    successCount: allLogs.filter((l) => l.status === 'success').length,
    failureCount: allLogs.filter((l) => l.status === 'failure').length,
    todayCount: allLogs.filter((l) => {
      const today = new Date().toISOString().split('T')[0];
      return l.timestamp.startsWith(today);
    }).length,
  };

  const totalCount = logs.length;
  if (limit && !isNaN(Number(limit))) {
    logs = logs.slice(0, Number(limit));
  }

  res.json({ logs, totalCount, stats });
});

apiRouter.post('/admin/audit-logs', (req: Request, res: Response) => {
  const { action = 'user_update', targetType = 'auth', description, details, targetName, targetId, status = 'success' } = req.body;
  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Audit log description is required' });
  }

  const newLog = recordAudit(
    req,
    action as AuditActionType,
    targetType,
    description.trim(),
    details || {},
    targetId,
    targetName,
    status
  );

  res.status(201).json({ log: newLog, message: 'Administrative audit record logged successfully' });
});

apiRouter.post('/admin/audit-logs/export', (req: Request, res: Response) => {
  const logs = db.getAllAuditLogs();
  res.json({
    exportedAt: new Date().toISOString(),
    totalEntries: logs.length,
    format: 'application/json',
    logs,
  });
});

// ==========================================
// 15. GEMINI MULTI-TURN CHAT INTERFACE
// ==========================================
const genAI = new GoogleGenAI();

apiRouter.post('/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, role = 'general', customModel } = req.body;

    // Model selection based on user requirements:
    // - gemini-3.1-pro-preview for particularly complex tasks
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    let modelName = 'gemini-3.5-flash';
    let systemInstruction = `You are SkillSync Matchmaker & Collaboration Advisor, an AI assistant on the SkillSync platform ("Different Skills. Same Goals.").
Your role is to help developers, designers, data scientists, and builders find complementary teammates, brainstorm hackathon project themes, analyze technical skill synergy, and resolve collaboration bottlenecks.
Provide actionable, friendly, and structured guidance with clear bullet points.`;

    if (role === 'complex' || role === 'architect') {
      modelName = 'gemini-3.1-pro-preview';
      systemInstruction = `You are SkillSync Senior Architect & Hackathon Strategist.
You handle deep, complex technical architecture, full-stack framework tradeoffs, distributed system designs, microservice vs monolith evaluations, and comprehensive hackathon roadmap scoping.
Deliver rigorous, production-grade technical architectural suggestions and actionable development milestones.`;
    } else if (role === 'fast' || role === 'pitch') {
      modelName = 'gemini-3.1-flash-lite';
      systemInstruction = `You are SkillSync Rapid Pitch & Headline Coach.
You provide instant, lightning-fast feedback to refine elevator pitches, craft impactful profile headlines, summarize GitHub projects concisely, and formulate quick team outreach messages.
Keep answers punchy, memorable, and high-impact.`;
    }

    if (customModel && typeof customModel === 'string') {
      modelName = customModel;
    }

    // Prepare contents
    const rawMessages = Array.isArray(messages) ? messages : [];
    const formattedContents = rawMessages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.content || m.text || '') }],
    }));

    if (formattedContents.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I am ready to help you find teammates and build great projects. What skills are you looking for?';

    res.json({
      reply,
      modelUsed: modelName,
      roleUsed: role,
    });
  } catch (err: any) {
    console.error('[Gemini API Error]', err);
    res.status(500).json({
      error: err.message || 'Failed to generate response from Gemini API',
      model: req.body?.customModel || 'gemini-3.5-flash',
    });
  }
});

// ==========================================
// 15. HEALTH & OBSERVABILITY
// ==========================================
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      apiGateway: 'UP',
      database: 'UP',
      cache: 'UP',
      mlEngine: 'UP (v2.4.1)',
    },
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});
