import {
  UserProfile,
  Team,
  Opportunity,
  ConnectionAction,
  Conversation,
  ChatMessage,
  NotificationItem,
  ModerationReport,
  AdminStats,
  AuditLogEntry,
} from '../../src/types/index.js';
import { getEngineWeights } from './matchingEngine.js';

// Seed Database with 20 Diverse, High-Caliber Profiles
export const SEED_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    email: 'sarah.chen@example.com',
    username: 'sarahchen',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    headline: 'Senior Computer Vision & Edge AI Engineer',
    bio: 'Passionate about deploying lightweight deep learning models on edge devices. Looking for frontend specialists and product designers to team up for Healthcare AI hackathons.',
    location: 'San Francisco, CA (Remote Friendly)',
    role: 'candidate',
    mode: 'solo',
    availability: 'available_now',
    commitmentHoursPerWeek: 20,
    goals: ['hackathons', 'startups', 'research'],
    skills: [
      { id: 'sk-1', name: 'Python', category: 'Programming', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-2', name: 'PyTorch', category: 'AI/ML', proficiency: 'expert', yearsOfExperience: 5, verified: true },
      { id: 'sk-3', name: 'Computer Vision', category: 'AI/ML', proficiency: 'expert', yearsOfExperience: 5, verified: true },
      { id: 'sk-4', name: 'FastAPI', category: 'Backend', proficiency: 'advanced', yearsOfExperience: 4, verified: true },
      { id: 'sk-5', name: 'Docker', category: 'DevOps', proficiency: 'advanced', yearsOfExperience: 3, verified: false },
    ],
    lookingForSkills: ['React', 'TypeScript', 'UI/UX Design', 'Figma', 'Product Management'],
    education: [
      { id: 'edu-1', institution: 'UC Berkeley', degree: 'M.S. in Electrical Engineering & CS', fieldOfStudy: 'Computer Vision', startDate: '2020', endDate: '2022' },
      { id: 'edu-2', institution: 'UCLA', degree: 'B.S. in Computer Science', fieldOfStudy: 'Software Systems', startDate: '2016', endDate: '2020' },
    ],
    experience: [
      {
        id: 'exp-1',
        company: 'VisionPulse Health',
        role: 'Senior ML Engineer',
        location: 'San Francisco, CA',
        startDate: '2022',
        current: true,
        description: 'Trained real-time diagnostic models running on mobile edge hardware with 98.4% sensitivity.',
        skills: ['PyTorch', 'Python', 'CUDA', 'FastAPI'],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'RetinaScan Edge',
        description: 'Open-source mobile-first retinal imaging scanner model using quantized MobileNetV4.',
        role: 'Lead ML Architect',
        technologies: ['PyTorch', 'FastAPI', 'Docker', 'OpenCV'],
        githubUrl: 'https://github.com/sarahchen/retinascan-edge',
        liveDemoUrl: 'https://retinascan-demo.dev',
        outcome: 'Won 1st place in BioMed Global AI Challenge 2025',
        stars: 340,
        featured: true,
      },
    ],
    github: {
      connected: true,
      username: 'sarahchen-ai',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      publicReposCount: 38,
      followers: 412,
      topLanguages: [
        { language: 'Python', percentage: 70 },
        { language: 'C++', percentage: 20 },
        { language: 'Shell', percentage: 10 },
      ],
      featuredRepos: [
        {
          id: 'gh-1',
          name: 'edge-quantizer',
          fullName: 'sarahchen-ai/edge-quantizer',
          description: 'Automated 8-bit model quantization toolkit for embedded GPUs',
          language: 'Python',
          stars: 520,
          forks: 64,
          htmlUrl: 'https://github.com/sarahchen-ai/edge-quantizer',
          updatedAt: '2026-03-10T12:00:00Z',
          featured: true,
        },
      ],
      lastSyncedAt: '2026-03-20T10:00:00Z',
    },
    leetcode: {
      connected: true,
      username: 'sarah_ai',
      totalSolved: 480,
      easySolved: 140,
      mediumSolved: 260,
      hardSolved: 80,
      ranking: 11420,
      contestRating: 2045,
      badges: ['Knight', 'Guardian', 'Top 2% Contests'],
      topLanguage: 'Python',
      lastSyncedAt: '2026-03-22T08:00:00Z',
    },
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
    completenessScore: 94,
    teamsJoinedCount: 2,
    createdAt: '2025-11-12T10:00:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
  },
  {
    id: 'usr-2',
    email: 'alex.rivera@example.com',
    username: 'alexrivera',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    headline: 'Staff Frontend Engineer & Design Systems Specialist',
    bio: 'Obsessed with micro-interactions, responsive layouts, and zero-pill UI architectures. Seeking ML engineers and backend architects to build next-generation collaboration apps.',
    location: 'Austin, TX',
    role: 'candidate',
    mode: 'solo',
    availability: 'available_now',
    commitmentHoursPerWeek: 25,
    goals: ['hackathons', 'startups', 'open_source'],
    skills: [
      { id: 'sk-6', name: 'React', category: 'Frontend', proficiency: 'expert', yearsOfExperience: 7, verified: true },
      { id: 'sk-7', name: 'TypeScript', category: 'Programming', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-8', name: 'Tailwind CSS', category: 'Frontend', proficiency: 'expert', yearsOfExperience: 5, verified: true },
      { id: 'sk-9', name: 'Figma', category: 'UI/UX', proficiency: 'advanced', yearsOfExperience: 4, verified: true },
      { id: 'sk-10', name: 'Next.js', category: 'Frontend', proficiency: 'expert', yearsOfExperience: 5, verified: true },
    ],
    lookingForSkills: ['Python', 'FastAPI', 'PyTorch', 'Go (Golang)', 'Machine Learning'],
    education: [
      { id: 'edu-3', institution: 'University of Texas at Austin', degree: 'B.S. in Software Engineering', fieldOfStudy: 'Human-Computer Interaction', startDate: '2017', endDate: '2021' },
    ],
    experience: [
      {
        id: 'exp-2',
        company: 'Stratos Labs',
        role: 'Staff Frontend Engineer',
        location: 'Austin, TX',
        startDate: '2021',
        current: true,
        description: 'Led multi-brand design system used by 45 frontend engineers; reduced bundle size by 38%.',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'],
      },
    ],
    projects: [
      {
        id: 'proj-2',
        title: 'Prism UI Components',
        description: 'Accessible, unstyled headless UI primitive set built with React and Radix core.',
        role: 'Creator & Maintainer',
        technologies: ['React', 'TypeScript', 'Tailwind CSS'],
        githubUrl: 'https://github.com/alexrivera/prism-ui',
        liveDemoUrl: 'https://prism-ui.dev',
        outcome: 'Adopted by 12 startup products, 840 GitHub stars',
        stars: 840,
        featured: true,
      },
    ],
    github: {
      connected: true,
      username: 'alexrivera-dev',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      publicReposCount: 42,
      followers: 620,
      topLanguages: [
        { language: 'TypeScript', percentage: 80 },
        { language: 'CSS', percentage: 15 },
        { language: 'Rust', percentage: 5 },
      ],
      featuredRepos: [
        {
          id: 'gh-2',
          name: 'canvas-engine',
          fullName: 'alexrivera-dev/canvas-engine',
          description: 'GPU-accelerated vector canvas for web dashboards',
          language: 'TypeScript',
          stars: 1240,
          forks: 110,
          htmlUrl: 'https://github.com/alexrivera-dev/canvas-engine',
          updatedAt: '2026-03-18T16:00:00Z',
          featured: true,
        },
      ],
      lastSyncedAt: '2026-03-24T11:00:00Z',
    },
    leetcode: {
      connected: true,
      username: 'alex_frontend',
      totalSolved: 310,
      easySolved: 160,
      mediumSolved: 130,
      hardSolved: 20,
      ranking: 42300,
      contestRating: 1720,
      badges: ['Knight', '50 Days 2025'],
      topLanguage: 'TypeScript',
      lastSyncedAt: '2026-03-15T09:00:00Z',
    },
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
      preferredCommitmentHoursPerWeek: 20,
    },
    completenessScore: 96,
    teamsJoinedCount: 3,
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2026-03-25T16:00:00Z',
  },
  {
    id: 'usr-3',
    email: 'marcus.vance@example.com',
    username: 'marcusvance',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    headline: 'Product Designer & UX Researcher',
    bio: 'Crafting intuitive user workflows from qualitative research to high-fidelity interactive prototypes. Focused on developer tools and complex SaaS platforms.',
    location: 'Brooklyn, NY (Remote)',
    role: 'candidate',
    mode: 'solo',
    availability: 'looking_for_team',
    commitmentHoursPerWeek: 15,
    goals: ['hackathons', 'startups', 'projects'],
    skills: [
      { id: 'sk-11', name: 'Figma', category: 'UI/UX', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-12', name: 'UI/UX Design', category: 'UI/UX', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-13', name: 'User Research', category: 'UI/UX', proficiency: 'expert', yearsOfExperience: 5, verified: true },
      { id: 'sk-14', name: 'Design Systems', category: 'UI/UX', proficiency: 'advanced', yearsOfExperience: 4, verified: true },
      { id: 'sk-15', name: 'Product Management', category: 'Product', proficiency: 'intermediate', yearsOfExperience: 2, verified: false },
    ],
    lookingForSkills: ['React', 'Node.js', 'FastAPI', 'Python', 'Machine Learning'],
    education: [
      { id: 'edu-4', institution: 'Rhode Island School of Design', degree: 'B.F.A. in Graphic & Interaction Design', fieldOfStudy: 'Design', startDate: '2016', endDate: '2020' },
    ],
    experience: [
      {
        id: 'exp-3',
        company: 'Veloce Studio',
        role: 'Lead Product Designer',
        location: 'New York, NY',
        startDate: '2021',
        current: true,
        description: 'Redesigned core onboarding flow increasing developer team activation by 42%.',
        skills: ['Figma', 'UI/UX Design', 'User Research'],
      },
    ],
    projects: [
      {
        id: 'proj-3',
        title: 'DevPulse UX Kit',
        description: 'Comprehensive Figma community library with 200+ developer tool components.',
        role: 'Author & Designer',
        technologies: ['Figma', 'Design Systems', 'Tokens'],
        liveDemoUrl: 'https://figma.com/@marcusvance',
        outcome: 'Over 14,000 Figma community duplicates',
        featured: true,
      },
    ],
    github: {
      connected: false,
      username: '',
      topLanguages: [],
      featuredRepos: [],
    },
    leetcode: {
      connected: false,
    },
    privacy: {
      profileVisibility: 'public',
      resumeVisibility: true,
      githubVisibility: false,
      leetcodeVisibility: false,
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
    completenessScore: 88,
    teamsJoinedCount: 1,
    createdAt: '2025-12-05T09:00:00Z',
    updatedAt: '2026-03-21T18:00:00Z',
  },
  {
    id: 'usr-4',
    email: 'priya.sharma@example.com',
    username: 'priyasharma',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    headline: 'Distributed Systems & Go Backend Engineer',
    bio: 'Building low-latency event-driven backends, database replication layers, and gRPC microservices. Eager to collaborate on high-scale hackathon infrastructure and open-source engines.',
    location: 'Seattle, WA',
    role: 'candidate',
    mode: 'solo',
    availability: 'available_now',
    commitmentHoursPerWeek: 20,
    goals: ['hackathons', 'open_source', 'startups'],
    skills: [
      { id: 'sk-16', name: 'Go (Golang)', category: 'Backend', proficiency: 'expert', yearsOfExperience: 5, verified: true },
      { id: 'sk-17', name: 'PostgreSQL', category: 'Backend', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-18', name: 'Redis', category: 'Backend', proficiency: 'advanced', yearsOfExperience: 4, verified: true },
      { id: 'sk-19', name: 'Docker', category: 'DevOps', proficiency: 'advanced', yearsOfExperience: 4, verified: true },
      { id: 'sk-20', name: 'Kubernetes', category: 'Cloud', proficiency: 'intermediate', yearsOfExperience: 3, verified: false },
    ],
    lookingForSkills: ['React', 'TypeScript', 'UI/UX Design', 'Next.js'],
    education: [
      { id: 'edu-5', institution: 'University of Washington', degree: 'M.S. in Computer Science', fieldOfStudy: 'Distributed Systems', startDate: '2019', endDate: '2021' },
    ],
    experience: [
      {
        id: 'exp-4',
        company: 'CloudScale Technologies',
        role: 'Distributed Systems Engineer',
        location: 'Seattle, WA',
        startDate: '2021',
        current: true,
        description: 'Maintained global distributed lock manager processing 250k transactions/sec with sub-millisecond p99 latency.',
        skills: ['Go (Golang)', 'PostgreSQL', 'Redis', 'Docker'],
      },
    ],
    projects: [
      {
        id: 'proj-4',
        title: 'HydraKV Storage',
        description: 'Persistent log-structured merge-tree key-value engine with Raft replication in pure Go.',
        role: 'Creator & Lead',
        technologies: ['Go (Golang)', 'Raft', 'gRPC'],
        githubUrl: 'https://github.com/priyasharma/hydrakv',
        outcome: 'Featured in Hacker News front page, 1,120 stars',
        stars: 1120,
        featured: true,
      },
    ],
    github: {
      connected: true,
      username: 'priyasharma-go',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      publicReposCount: 29,
      followers: 780,
      topLanguages: [
        { language: 'Go', percentage: 75 },
        { language: 'Rust', percentage: 15 },
        { language: 'C', percentage: 10 },
      ],
      featuredRepos: [
        {
          id: 'gh-4',
          name: 'hydrakv',
          fullName: 'priyasharma-go/hydrakv',
          description: 'LSM-tree key value storage engine in Go',
          language: 'Go',
          stars: 1120,
          forks: 95,
          htmlUrl: 'https://github.com/priyasharma-go/hydrakv',
          updatedAt: '2026-03-22T08:00:00Z',
          featured: true,
        },
      ],
      lastSyncedAt: '2026-03-25T14:00:00Z',
    },
    leetcode: {
      connected: true,
      username: 'priya_go',
      totalSolved: 540,
      easySolved: 120,
      mediumSolved: 310,
      hardSolved: 110,
      ranking: 6100,
      contestRating: 2150,
      badges: ['Guardian', 'Knight', 'Top 1% Contests'],
      topLanguage: 'Go',
      lastSyncedAt: '2026-03-24T18:00:00Z',
    },
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
    completenessScore: 98,
    teamsJoinedCount: 2,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-03-24T19:00:00Z',
  },
  {
    id: 'usr-5',
    email: 'david.kim@example.com',
    username: 'davidkim',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    headline: 'Native Mobile Architect (Kotlin & Jetpack Compose)',
    bio: 'Architecting fluid, offline-first native Android applications using Jetpack Compose, Coroutines, and clean architecture. Ready to ship production apps for startups.',
    location: 'Chicago, IL (Hybrid)',
    role: 'candidate',
    mode: 'solo',
    availability: 'looking_for_team',
    commitmentHoursPerWeek: 20,
    goals: ['startups', 'hackathons', 'projects'],
    skills: [
      { id: 'sk-21', name: 'Kotlin', category: 'Mobile', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-22', name: 'Jetpack Compose', category: 'Mobile', proficiency: 'expert', yearsOfExperience: 4, verified: true },
      { id: 'sk-23', name: 'FastAPI', category: 'Backend', proficiency: 'intermediate', yearsOfExperience: 2, verified: false },
      { id: 'sk-24', name: 'UI/UX Design', category: 'UI/UX', proficiency: 'intermediate', yearsOfExperience: 3, verified: false },
    ],
    lookingForSkills: ['Python', 'FastAPI', 'Go (Golang)', 'PostgreSQL', 'Machine Learning'],
    education: [
      { id: 'edu-6', institution: 'University of Illinois Urbana-Champaign', degree: 'B.S. in Computer Science', fieldOfStudy: 'Mobile Systems', startDate: '2018', endDate: '2022' },
    ],
    experience: [
      {
        id: 'exp-5',
        company: 'Pulse Mobility',
        role: 'Senior Android Engineer',
        location: 'Chicago, IL',
        startDate: '2022',
        current: true,
        description: 'Engineered multi-module Compose architecture serving 350k DAU with 99.9% crash-free sessions.',
        skills: ['Kotlin', 'Jetpack Compose'],
      },
    ],
    projects: [
      {
        id: 'proj-5',
        title: 'OfflineSync Mobile Engine',
        description: 'Bi-directional offline synchronizer for Jetpack Compose apps backed by SQLite and WebSockets.',
        role: 'Creator',
        technologies: ['Kotlin', 'Jetpack Compose', 'SQLite'],
        githubUrl: 'https://github.com/davidkim/offlinesync-engine',
        outcome: 'Featured in Android Weekly #610',
        stars: 460,
        featured: true,
      },
    ],
    github: {
      connected: true,
      username: 'davidkim-android',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      publicReposCount: 22,
      followers: 240,
      topLanguages: [
        { language: 'Kotlin', percentage: 85 },
        { language: 'Java', percentage: 10 },
        { language: 'Swift', percentage: 5 },
      ],
      featuredRepos: [],
      lastSyncedAt: '2026-03-20T12:00:00Z',
    },
    leetcode: {
      connected: true,
      username: 'dkim_algo',
      totalSolved: 280,
      easySolved: 110,
      mediumSolved: 140,
      hardSolved: 30,
      ranking: 55000,
      contestRating: 1680,
      badges: ['50 Days 2025'],
      topLanguage: 'Kotlin',
      lastSyncedAt: '2026-03-18T10:00:00Z',
    },
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
    completenessScore: 91,
    teamsJoinedCount: 1,
    createdAt: '2025-12-10T12:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z',
  },
  {
    id: 'usr-6',
    email: 'aisha.patel@example.com',
    username: 'aishapatel',
    name: 'Aisha Patel',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80',
    headline: 'Technical Product Manager & Growth Strategist',
    bio: 'Translating deep tech and AI capabilities into validated customer value. Experienced with roadmap execution, user validation sprints, and hackathon pitching.',
    location: 'Boston, MA (Remote)',
    role: 'candidate',
    mode: 'solo',
    availability: 'available_now',
    commitmentHoursPerWeek: 15,
    goals: ['hackathons', 'startups', 'networking'],
    skills: [
      { id: 'sk-25', name: 'Product Management', category: 'Product', proficiency: 'expert', yearsOfExperience: 5, verified: true },
      { id: 'sk-26', name: 'User Research', category: 'UI/UX', proficiency: 'advanced', yearsOfExperience: 4, verified: true },
      { id: 'sk-27', name: 'Figma', category: 'UI/UX', proficiency: 'intermediate', yearsOfExperience: 3, verified: false },
      { id: 'sk-28', name: 'Python', category: 'Programming', proficiency: 'intermediate', yearsOfExperience: 3, verified: false },
    ],
    lookingForSkills: ['React', 'TypeScript', 'PyTorch', 'Machine Learning', 'FastAPI'],
    education: [
      { id: 'edu-7', institution: 'MIT Sloan', degree: 'M.B.A. in Product Innovation', fieldOfStudy: 'Technology Strategy', startDate: '2020', endDate: '2022' },
      { id: 'edu-8', institution: 'Cornell University', degree: 'B.S. in Information Science', fieldOfStudy: 'Data Systems', startDate: '2015', endDate: '2019' },
    ],
    experience: [
      {
        id: 'exp-6',
        company: 'CognitiveScale',
        role: 'Lead Product Manager',
        location: 'Boston, MA',
        startDate: '2022',
        current: true,
        description: 'Owned AI product roadmap from zero to 12 Enterprise beta pilots.',
        skills: ['Product Management', 'User Research'],
      },
    ],
    projects: [
      {
        id: 'proj-6',
        title: 'PitchSprint Framework',
        description: 'Structured framework for tech teams to validate and pitch hackathon prototypes in 48 hours.',
        role: 'Creator',
        technologies: ['Product Strategy', 'Figma', 'Analytics'],
        outcome: 'Used by 24 winning hackathon squads',
        featured: true,
      },
    ],
    github: {
      connected: false,
      username: '',
      topLanguages: [],
      featuredRepos: [],
    },
    leetcode: {
      connected: false,
    },
    privacy: {
      profileVisibility: 'public',
      resumeVisibility: true,
      githubVisibility: false,
      leetcodeVisibility: false,
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
    completenessScore: 89,
    teamsJoinedCount: 2,
    createdAt: '2025-11-20T11:00:00Z',
    updatedAt: '2026-03-24T12:00:00Z',
  },
  {
    id: 'usr-7',
    email: 'carlos.mendez@example.com',
    username: 'carlosmendez',
    name: 'Carlos Mendez',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    headline: 'DevOps & Cloud Security Architect',
    bio: 'Automating immutable infrastructure, zero-trust mesh networking, and hardened CI/CD pipelines. Seeking to support startup infrastructure and hackathon deployments.',
    location: 'Denver, CO (Remote)',
    role: 'candidate',
    mode: 'solo',
    availability: 'open_to_collab',
    commitmentHoursPerWeek: 12,
    goals: ['hackathons', 'startups', 'open_source'],
    skills: [
      { id: 'sk-29', name: 'Docker', category: 'DevOps', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-30', name: 'Kubernetes', category: 'Cloud', proficiency: 'expert', yearsOfExperience: 5, verified: true },
      { id: 'sk-31', name: 'AWS Cloud', category: 'Cloud', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-32', name: 'Cybersecurity', category: 'Security', proficiency: 'advanced', yearsOfExperience: 4, verified: true },
      { id: 'sk-33', name: 'Python', category: 'Programming', proficiency: 'advanced', yearsOfExperience: 4, verified: false },
    ],
    lookingForSkills: ['React', 'Node.js', 'Go (Golang)', 'FastAPI'],
    education: [
      { id: 'edu-9', institution: 'University of Colorado Boulder', degree: 'B.S. in Computer Systems', fieldOfStudy: 'Cybersecurity', startDate: '2017', endDate: '2021' },
    ],
    experience: [
      {
        id: 'exp-7',
        company: 'Sentinel Cloud',
        role: 'Staff DevOps Architect',
        location: 'Denver, CO',
        startDate: '2021',
        current: true,
        description: 'Architected automated SOC2 Type II compliant multi-region Kubernetes clusters.',
        skills: ['Kubernetes', 'Docker', 'AWS Cloud', 'Cybersecurity'],
      },
    ],
    projects: [
      {
        id: 'proj-7',
        title: 'ClusterLock CLI',
        description: 'Lightweight static analysis tool for Kubernetes manifests and Helm charts.',
        role: 'Maintainer',
        technologies: ['Go (Golang)', 'Kubernetes', 'Docker'],
        githubUrl: 'https://github.com/carlosmendez/clusterlock',
        outcome: '520 stars on GitHub, integrated into 3 CI systems',
        stars: 520,
        featured: true,
      },
    ],
    github: {
      connected: true,
      username: 'carlosm-ops',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      publicReposCount: 31,
      followers: 310,
      topLanguages: [
        { language: 'Go', percentage: 50 },
        { language: 'HCL (Terraform)', percentage: 35 },
        { language: 'Python', percentage: 15 },
      ],
      featuredRepos: [],
      lastSyncedAt: '2026-03-19T10:00:00Z',
    },
    leetcode: {
      connected: false,
    },
    privacy: {
      profileVisibility: 'public',
      resumeVisibility: true,
      githubVisibility: true,
      leetcodeVisibility: false,
      timelineVisibility: true,
      onlineStatusVisibility: true,
      allowDirectMessagesFrom: 'anyone',
    },
    preferences: {
      emailNotifications: true,
      matchAlerts: true,
      teamInvites: true,
      opportunityDeadlines: true,
      preferredCommitmentHoursPerWeek: 12,
    },
    completenessScore: 90,
    teamsJoinedCount: 1,
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2026-03-22T14:00:00Z',
  },
  {
    id: 'usr-8',
    email: 'maya.lin@example.com',
    username: 'mayalin',
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    headline: 'NLP & Large Language Models Researcher',
    bio: 'Specializing in retrieval-augmented generation (RAG), vector similarity indexing, and model evaluation protocols. Looking for frontend engineers to build accessible AI interfaces.',
    location: 'Toronto, Canada (Remote)',
    role: 'candidate',
    mode: 'solo',
    availability: 'available_now',
    commitmentHoursPerWeek: 18,
    goals: ['hackathons', 'research', 'startups'],
    skills: [
      { id: 'sk-34', name: 'NLP & LLMs', category: 'AI/ML', proficiency: 'expert', yearsOfExperience: 4, verified: true },
      { id: 'sk-35', name: 'PyTorch', category: 'AI/ML', proficiency: 'expert', yearsOfExperience: 5, verified: true },
      { id: 'sk-36', name: 'Python', category: 'Programming', proficiency: 'expert', yearsOfExperience: 6, verified: true },
      { id: 'sk-37', name: 'FastAPI', category: 'Backend', proficiency: 'advanced', yearsOfExperience: 3, verified: true },
    ],
    lookingForSkills: ['React', 'TypeScript', 'UI/UX Design', 'Tailwind CSS'],
    education: [
      { id: 'edu-10', institution: 'University of Toronto', degree: 'M.S. in Machine Learning', fieldOfStudy: 'NLP', startDate: '2021', endDate: '2023' },
    ],
    experience: [
      {
        id: 'exp-8',
        company: 'Vector Research Labs',
        role: 'AI Research Scientist',
        location: 'Toronto, ON',
        startDate: '2023',
        current: true,
        description: 'Published 2 papers on dense passage retrieval efficiency under low compute budgets.',
        skills: ['PyTorch', 'NLP & LLMs', 'Python'],
      },
    ],
    projects: [
      {
        id: 'proj-8',
        title: 'VeriRAG Benchmark',
        description: 'Open evaluation harness for measuring hallucination rates in enterprise RAG pipelines.',
        role: 'Lead Researcher',
        technologies: ['Python', 'PyTorch', 'FastAPI'],
        githubUrl: 'https://github.com/mayalin/verirag',
        outcome: 'Over 680 GitHub stars, cited in ACL 2025 workshop',
        stars: 680,
        featured: true,
      },
    ],
    github: {
      connected: true,
      username: 'mayalin-nlp',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      publicReposCount: 26,
      followers: 512,
      topLanguages: [
        { language: 'Python', percentage: 90 },
        { language: 'Shell', percentage: 10 },
      ],
      featuredRepos: [],
      lastSyncedAt: '2026-03-21T09:00:00Z',
    },
    leetcode: {
      connected: true,
      username: 'maya_nlp',
      totalSolved: 390,
      easySolved: 130,
      mediumSolved: 210,
      hardSolved: 50,
      ranking: 22100,
      contestRating: 1910,
      badges: ['Knight'],
      topLanguage: 'Python',
      lastSyncedAt: '2026-03-20T11:00:00Z',
    },
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
      preferredCommitmentHoursPerWeek: 18,
    },
    completenessScore: 95,
    teamsJoinedCount: 1,
    createdAt: '2025-11-15T09:00:00Z',
    updatedAt: '2026-03-24T16:00:00Z',
  },
  {
    id: 'usr-admin',
    email: 'admin@skillsync.io',
    username: 'admin',
    name: 'DevOps & Safety Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    headline: 'SkillSync Security & Operations Supervisor',
    bio: 'Overseeing network telemetry, verified credentials, and team safety standards.',
    location: 'Operations HQ',
    role: 'admin',
    mode: 'solo',
    availability: 'available_now',
    commitmentHoursPerWeek: 40,
    goals: ['projects'],
    skills: [
      { id: 'sk-adm-1', name: 'Cybersecurity', category: 'Security', proficiency: 'expert', yearsOfExperience: 8, verified: true },
      { id: 'sk-adm-2', name: 'Product Management', category: 'Product', proficiency: 'expert', yearsOfExperience: 7, verified: true },
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
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-03-28T00:00:00Z',
  },
];

// Pre-seeded Teams with Missing Roles & Skills
export const SEED_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'NeuroCraft AI',
    slug: 'neurocraft-ai',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    tagline: 'Edge AI Diagnostic Diagnostic Assistant for Healthcare Workers',
    description: 'We are building an offline-first diagnostic assistant powered by quantized multimodal vision models to run in rural healthcare clinics. Our backend and ML layers are built; we urgently need frontend and design talent to build the clinical dashboard.',
    mission: 'Empower primary care clinics worldwide with instant, offline multimodal diagnostic assistance.',
    projectFocus: 'Healthcare AI / Edge Inference Diagnostic Tool',
    techStack: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'PostgreSQL'],
    members: [
      {
        userId: 'usr-1',
        user: {
          id: 'usr-1',
          name: 'Sarah Chen',
          username: 'sarahchen',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
          headline: 'Senior Computer Vision & Edge AI Engineer',
        },
        role: 'ML Architecture Lead',
        joinedAt: '2026-01-10T10:00:00Z',
        isLead: true,
      },
      {
        userId: 'usr-4',
        user: {
          id: 'usr-4',
          name: 'Priya Sharma',
          username: 'priyasharma',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
          headline: 'Distributed Systems & Go Backend Engineer',
        },
        role: 'Backend Infrastructure Lead',
        joinedAt: '2026-01-15T12:00:00Z',
        isLead: false,
      },
    ],
    openRequirements: [
      {
        id: 'req-1',
        title: 'Lead Frontend Engineer',
        description: 'Build responsive, fast React interface for clinical review and offline synchronization.',
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
        proficiencyNeeded: 'expert',
        isFilled: false,
        appliedCount: 4,
      },
      {
        id: 'req-2',
        title: 'UI/UX Clinical Designer',
        description: 'Design zero-cognitive-overhead UI for doctors and field health workers.',
        requiredSkills: ['Figma', 'UI/UX Design', 'User Research'],
        proficiencyNeeded: 'advanced',
        isFilled: false,
        appliedCount: 2,
      },
    ],
    teamSizeMax: 4,
    availability: 'looking_for_members',
    opportunityType: 'hackathon',
    targetOpportunityId: 'opp-1',
    githubUrl: 'https://github.com/neurocraft-ai/clinical-core',
    demoUrl: 'https://neurocraft-preview.dev',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-03-24T12:00:00Z',
  },
  {
    id: 'team-2',
    name: 'OmniFlow Engines',
    slug: 'omniflow-engines',
    logo: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
    tagline: 'High-Throughput Open Source Event Orchestration Engine',
    description: 'Building next-generation open-source distributed event orchestration with sub-millisecond dispatch and deterministic replay.',
    mission: 'Provide an unopinionated, blazing fast orchestration runtime for high-throughput enterprise events.',
    projectFocus: 'Open Source Distributed Systems & Orchestration',
    techStack: ['Go (Golang)', 'Kubernetes', 'Docker', 'Redis', 'PostgreSQL'],
    members: [
      {
        userId: 'usr-4',
        user: {
          id: 'usr-4',
          name: 'Priya Sharma',
          username: 'priyasharma',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
          headline: 'Distributed Systems & Go Backend Engineer',
        },
        role: 'Core Engine Architect',
        joinedAt: '2025-12-01T10:00:00Z',
        isLead: true,
      },
      {
        userId: 'usr-7',
        user: {
          id: 'usr-7',
          name: 'Carlos Mendez',
          username: 'carlosmendez',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
          headline: 'DevOps & Cloud Security Architect',
        },
        role: 'Infrastructure & Release Lead',
        joinedAt: '2025-12-05T14:00:00Z',
        isLead: false,
      },
    ],
    openRequirements: [
      {
        id: 'req-3',
        title: 'Full-Stack Web Console Lead',
        description: 'Architect web dashboard for live DAG workflow monitoring, node inspection, and audit logs.',
        requiredSkills: ['React', 'TypeScript', 'Next.js'],
        proficiencyNeeded: 'advanced',
        isFilled: false,
        appliedCount: 5,
      },
    ],
    teamSizeMax: 4,
    availability: 'looking_for_members',
    opportunityType: 'open_source',
    targetOpportunityId: 'opp-3',
    githubUrl: 'https://github.com/omniflow-engines/orchestrator',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-03-22T16:00:00Z',
  },
  {
    id: 'team-3',
    name: 'PulseNative Health',
    slug: 'pulsenative-health',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',
    tagline: 'Continuous Cardiovascular Health Tracker for Android & WearOS',
    description: 'We are creating a privacy-first continuous heart rate anomaly detection app with on-device tensor processing.',
    mission: 'Make clinical-grade preventative heart health monitoring accessible to everyone via everyday mobile devices.',
    projectFocus: 'Mobile Health / On-Device ML Anomaly Detection',
    techStack: ['Kotlin', 'Jetpack Compose', 'Python', 'FastAPI'],
    members: [
      {
        userId: 'usr-5',
        user: {
          id: 'usr-5',
          name: 'David Kim',
          username: 'davidkim',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          headline: 'Native Mobile Architect (Kotlin & Jetpack Compose)',
        },
        role: 'Mobile Architect',
        joinedAt: '2026-02-01T10:00:00Z',
        isLead: true,
      },
    ],
    openRequirements: [
      {
        id: 'req-4',
        title: 'ML Anomaly Detection Specialist',
        description: 'Train lightweight LSTM / 1D-CNN for real-time arrhythmia pattern detection.',
        requiredSkills: ['Python', 'PyTorch', 'Machine Learning'],
        proficiencyNeeded: 'expert',
        isFilled: false,
        appliedCount: 3,
      },
      {
        id: 'req-5',
        title: 'Product Growth Strategist',
        description: 'Lead clinical partner interviews, FDA regulatory prep, and startup pitch deck.',
        requiredSkills: ['Product Management', 'User Research'],
        proficiencyNeeded: 'advanced',
        isFilled: false,
        appliedCount: 1,
      },
    ],
    teamSizeMax: 3,
    availability: 'looking_for_members',
    opportunityType: 'startup',
    targetOpportunityId: 'opp-4',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-03-25T11:00:00Z',
  },
];

// Pre-seeded Opportunities (Hackathons, Contests, Startups, Open-Source)
export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Global AI for Good Hackathon 2026',
    slug: 'global-ai-for-good-2026',
    organizer: 'United Nations Tech Innovation Initiative',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    type: 'hackathon',
    headline: '$65,000 Prize Pool · Healthcare, Climate & Education Track',
    description: 'Join 1,500+ engineers, designers, and domain experts building AI applications that solve critical human challenges. Submit a working prototype and code repository to compete for global acceleration grants.',
    prizePool: '$65,000 USD',
    deadline: '2026-10-15T23:59:59Z',
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-10-18T18:00:00Z',
    locationType: 'remote',
    teamSizeRange: { min: 2, max: 5 },
    requiredSkills: ['Python', 'PyTorch', 'React', 'TypeScript', 'UI/UX Design'],
    eligibility: 'Open globally to individual creators and teams of up to 5 members.',
    totalParticipants: 840,
    participantIds: ['usr-1', 'usr-2', 'usr-3', 'usr-6', 'usr-8'],
    registeredTeams: ['team-1'],
    tags: ['Artificial Intelligence', 'Social Good', 'Healthcare', 'Global Impact'],
  },
  {
    id: 'opp-2',
    title: 'ETHGlobal Autonomous Worlds 2026',
    slug: 'ethglobal-autonomous-worlds-2026',
    organizer: 'ETHGlobal & Protocol Labs',
    logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80',
    type: 'hackathon',
    headline: '$120,000 in Bounties · On-Chain AI Agents & Spatial Systems',
    description: 'Build decentralized AI agent networks, verifiable compute protocols, and persistent digital states in an intensive 48-hour global sprint.',
    prizePool: '$120,000 USD',
    deadline: '2026-10-28T18:00:00Z',
    startDate: '2026-10-26T00:00:00Z',
    endDate: '2026-10-28T20:00:00Z',
    locationType: 'remote',
    teamSizeRange: { min: 2, max: 4 },
    requiredSkills: ['Solidity', 'TypeScript', 'React', 'Go (Golang)', 'Cybersecurity'],
    eligibility: 'Open worldwide. All submissions must be open-source on GitHub.',
    totalParticipants: 620,
    participantIds: ['usr-2', 'usr-4', 'usr-7'],
    registeredTeams: [],
    tags: ['Web3', 'AI Agents', 'Cryptography', 'Smart Contracts'],
  },
  {
    id: 'opp-3',
    title: 'Linux Foundation Open Source Fellowship Q4',
    slug: 'linux-foundation-fellowship-q4',
    organizer: 'Cloud Native Computing Foundation (CNCF)',
    logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    type: 'open_source',
    headline: 'Stipend $12,000 per Fellow · Mentorship with Core Maintainers',
    description: 'Work full-time or part-time contributing to foundational cloud-native distributed infrastructure, observability, and container networking.',
    prizePool: '$12,000 Stipend',
    deadline: '2026-11-01T23:59:59Z',
    startDate: '2026-11-15T00:00:00Z',
    endDate: '2027-02-15T00:00:00Z',
    locationType: 'remote',
    teamSizeRange: { min: 1, max: 3 },
    requiredSkills: ['Go (Golang)', 'Kubernetes', 'Docker', 'Rust'],
    eligibility: 'Developers with demonstrated Git contributions to open source.',
    totalParticipants: 310,
    participantIds: ['usr-4', 'usr-7'],
    registeredTeams: ['team-2'],
    tags: ['Open Source', 'CNCF', 'Golang', 'Infrastructure'],
  },
  {
    id: 'opp-4',
    title: 'Y Combinator W27 Co-Founder Showcase',
    slug: 'yc-w27-cofounder-showcase',
    organizer: 'Y Combinator Alumni Community',
    logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
    type: 'startup',
    headline: 'Fast-Track Partner Interviews & Angel Syndicate Matching',
    description: 'Form early-stage founding teams in AI, Developer Tooling, and BioTech. Pitch to YC alumni partners and secure angel syndication.',
    prizePool: 'Angel Investment Opportunities',
    deadline: '2026-11-10T23:59:59Z',
    startDate: '2026-11-01T00:00:00Z',
    endDate: '2026-11-20T00:00:00Z',
    locationType: 'hybrid',
    locationName: 'San Francisco & Remote',
    teamSizeRange: { min: 2, max: 3 },
    requiredSkills: ['Product Management', 'Python', 'React', 'Machine Learning'],
    eligibility: 'Technical and domain co-founders with an MVP or validated prototype.',
    totalParticipants: 450,
    participantIds: ['usr-1', 'usr-5', 'usr-6'],
    registeredTeams: ['team-3'],
    tags: ['Startups', 'Venture Capital', 'Co-Founders', 'San Francisco'],
  },
];

// Pre-seeded Connections
export const SEED_CONNECTIONS: ConnectionAction[] = [
  {
    id: 'conn-1',
    initiatorId: 'usr-1',
    receiverId: 'usr-2',
    status: 'accepted',
    message: 'Hey Alex! Loved your Prism UI component library. Our healthcare AI team is missing a lead frontend developer for the Global AI Hackathon.',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T14:00:00Z',
    initiator: {
      id: 'usr-1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      headline: 'Senior Computer Vision & Edge AI Engineer',
    },
    receiver: {
      id: 'usr-2',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      headline: 'Staff Frontend Engineer & Design Systems Specialist',
    },
  },
  {
    id: 'conn-2',
    initiatorId: 'usr-3',
    receiverId: 'usr-2',
    status: 'accepted',
    message: 'Hi Alex! I saw your work on design tokens. Would love to share some Figma tokens with your headless primitives.',
    createdAt: '2026-03-21T11:00:00Z',
    updatedAt: '2026-03-21T12:30:00Z',
    initiator: {
      id: 'usr-3',
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      headline: 'Product Designer & UX Researcher',
    },
    receiver: {
      id: 'usr-2',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      headline: 'Staff Frontend Engineer & Design Systems Specialist',
    },
  },
];

// Pre-seeded Messages
export const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'usr-1',
    senderName: 'Sarah Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    content: 'Hi Alex! Thanks for connecting. Have you had a chance to check out our team NeuroCraft AI for the Global AI Hackathon?',
    createdAt: '2026-03-20T14:05:00Z',
    readBy: ['usr-1', 'usr-2'],
    status: 'read',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'usr-2',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    content: 'Hey Sarah! Yes, I read through the mission. Quantized vision on edge devices sounds super compelling. How are you thinking of handling the web offline cache?',
    createdAt: '2026-03-20T14:12:00Z',
    readBy: ['usr-1', 'usr-2'],
    status: 'read',
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'usr-1',
    senderName: 'Sarah Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    content: 'Priya and I have an indexedDB cache syncing with FastAPI WebSockets. We would love for you to take charge of the clinical dashboard UI!',
    createdAt: '2026-03-20T14:20:00Z',
    readBy: ['usr-1', 'usr-2'],
    status: 'read',
  },
];

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      {
        id: 'usr-1',
        name: 'Sarah Chen',
        username: 'sarahchen',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        headline: 'Senior Computer Vision & Edge AI Engineer',
        online: true,
      },
      {
        id: 'usr-2',
        name: 'Alex Rivera',
        username: 'alexrivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        headline: 'Staff Frontend Engineer & Design Systems Specialist',
        online: true,
      },
    ],
    lastMessage: SEED_MESSAGES[2],
    unreadCount: 0,
    updatedAt: '2026-03-20T14:20:00Z',
  },
];

// Pre-seeded Notifications
export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-2',
    type: 'team_invite',
    title: 'Team Invitation: NeuroCraft AI',
    message: 'Sarah Chen invited you to join NeuroCraft AI as Lead Frontend Engineer for the Global AI Hackathon.',
    data: { teamId: 'team-1', requirementId: 'req-1' },
    read: false,
    createdAt: '2026-03-20T14:02:00Z',
  },
  {
    id: 'notif-2',
    userId: 'usr-2',
    type: 'new_match',
    title: 'High Compatibility Collaboration Match',
    message: 'Sarah Chen (96% compatibility) is looking for your React and TypeScript skills.',
    data: { userId: 'usr-1' },
    read: true,
    createdAt: '2026-03-20T09:30:00Z',
  },
  {
    id: 'notif-3',
    userId: 'usr-2',
    type: 'opportunity_deadline',
    title: 'Hackathon Deadline Reminder',
    message: 'Global AI for Good Hackathon registration closes in 17 days.',
    data: { opportunityId: 'opp-1' },
    read: true,
    createdAt: '2026-03-22T08:00:00Z',
  },
];

// Pre-seeded Initial Audit Logs
export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: '2026-03-28T08:15:22.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'admin_login',
    targetType: 'auth',
    targetId: 'usr-admin',
    targetName: 'DevOps & Safety Admin',
    description: 'Administrator authenticated via Staff Authorization Passkey',
    details: { authMethod: 'security_key', sessionDuration: '8h', mfaVerified: true },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-2',
    timestamp: '2026-03-27T14:40:10.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'weights_calibrate',
    targetType: 'algorithm',
    targetName: 'Recommendation Engine v2.4.1',
    description: 'Calibrated two-sided recommendation coefficients: skillComplementarity=0.30, semanticSimilarity=0.20',
    details: {
      previousWeights: { skillComplementarity: 0.25, semanticSimilarity: 0.25 },
      newWeights: { skillComplementarity: 0.30, semanticSimilarity: 0.20 },
      modelVersion: 'v2.4.1-hybrid-complementarity',
      targetAccuracyImprovement: '+4.2%',
    },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-3',
    timestamp: '2026-03-26T16:22:00.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'user_verify',
    targetType: 'user',
    targetId: 'usr-1',
    targetName: 'Sarah Chen',
    description: 'Granted official Verified Developer credentials following GitHub & publication validation',
    details: { verifiedSignals: ['github_sync', 'acm_publication_check', 'top_contributor'] },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-4',
    timestamp: '2026-03-25T11:05:40.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'opportunity_create',
    targetType: 'opportunity',
    targetId: 'opp-1',
    targetName: 'Global AI for Good Hackathon 2026',
    description: 'Published official international hackathon event with $65,000 USD prize pool',
    details: { prizePool: '$65,000 USD', deadline: '2026-10-15T23:59:59Z', locationType: 'remote' },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-5',
    timestamp: '2026-03-24T09:30:15.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'report_resolve',
    targetType: 'moderation',
    targetId: 'rep-seed-1',
    targetName: 'Report #1042',
    description: 'Investigated and dismissed false positive spam report for community discussion thread',
    details: { actionTaken: 'dismissed', reviewNotes: 'Content adheres to collaboration etiquette' },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-6',
    timestamp: '2026-03-23T18:12:00.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'user_suspend',
    targetType: 'user',
    targetId: 'usr-19',
    targetName: 'Marcus Vance',
    description: 'Temporarily suspended account following automated rate-limit abuse and suspicious portfolio scraping',
    details: { reason: 'Automated scraping violating Terms of Service', suspensionDurationDays: 14 },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-7',
    timestamp: '2026-03-22T13:45:30.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'team_update',
    targetType: 'team',
    targetId: 'team-3',
    targetName: 'NeuralAgents Lab',
    description: 'Approved official hackathon squad tags and validated requested technical stack requirements',
    details: { updatedFields: ['techStack', 'availability'], squadStatus: 'approved' },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-8',
    timestamp: '2026-03-21T10:15:00.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'user_update',
    targetType: 'user',
    targetId: 'usr-2',
    targetName: 'Alex Rivera',
    description: 'Elevated profile badges and confirmed verified Frontend Engineering competencies',
    details: { previousRole: 'candidate', newRole: 'candidate', verifiedBadge: true },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-9',
    timestamp: '2026-03-20T17:05:42.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'opportunity_update',
    targetType: 'opportunity',
    targetId: 'opp-2',
    targetName: 'FinTech Open Banking Sprint',
    description: 'Increased event prize bounty to $40,000 USD and extended submission window by 14 days',
    details: { previousPrize: '$30,000 USD', updatedPrize: '$40,000 USD', sponsor: 'Stripe Open Ecosystem' },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-10',
    timestamp: '2026-03-19T11:20:10.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'opportunity_delete',
    targetType: 'opportunity',
    targetId: 'opp-legacy-99',
    targetName: 'Archived Web3 Summer Hackathon 2024',
    description: 'Purged concluded legacy competition metadata and archived historical team registrations',
    details: { reason: 'Periodic database lifecycle archival', recordsArchived: 42 },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
  {
    id: 'audit-11',
    timestamp: '2026-03-18T09:00:00.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'admin_signup',
    targetType: 'auth',
    targetId: 'usr-admin-2',
    targetName: 'Elena Rostova',
    description: 'Provisioned secondary Staff Administrative credentials with Platform Operations clearance',
    details: { role: 'admin', clearanceLevel: 'ops_lead', approvedBy: 'SuperAdmin' },
    ipAddress: '10.0.4.12',
    status: 'success',
  },
  {
    id: 'audit-12',
    timestamp: '2026-03-17T15:33:18.000Z',
    adminId: 'usr-admin',
    adminName: 'DevOps & Safety Admin',
    adminEmail: 'admin@skillsync.io',
    action: 'user_unsuspend',
    targetType: 'user',
    targetId: 'usr-14',
    targetName: 'Liam O\'Connor',
    description: 'Restored full collaborator privileges following manual identity validation and appeals review',
    details: { appealStatus: 'accepted', reviewCompletedBy: 'DevOps & Safety Admin' },
    ipAddress: '192.168.1.104',
    status: 'success',
  },
];

// In-Memory Database Store Class
class DatabaseStore {
  private users: Map<string, UserProfile> = new Map();
  private teams: Map<string, Team> = new Map();
  private opportunities: Map<string, Opportunity> = new Map();
  private connections: Map<string, ConnectionAction> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, ChatMessage> = new Map();
  private notifications: Map<string, NotificationItem> = new Map();
  private reports: Map<string, ModerationReport> = new Map();
  private auditLogs: Map<string, AuditLogEntry> = new Map();
  private startTime = Date.now();

  constructor() {
    this.init();
  }

  private init() {
    SEED_USERS.forEach((u) => this.users.set(u.id, JSON.parse(JSON.stringify(u))));
    SEED_TEAMS.forEach((t) => this.teams.set(t.id, JSON.parse(JSON.stringify(t))));
    SEED_OPPORTUNITIES.forEach((o) => this.opportunities.set(o.id, JSON.parse(JSON.stringify(o))));
    SEED_CONNECTIONS.forEach((c) => this.connections.set(c.id, JSON.parse(JSON.stringify(c))));
    SEED_CONVERSATIONS.forEach((cv) => this.conversations.set(cv.id, JSON.parse(JSON.stringify(cv))));
    SEED_MESSAGES.forEach((m) => this.messages.set(m.id, JSON.parse(JSON.stringify(m))));
    SEED_NOTIFICATIONS.forEach((n) => this.notifications.set(n.id, JSON.parse(JSON.stringify(n))));
    SEED_AUDIT_LOGS.forEach((l) => this.auditLogs.set(l.id, JSON.parse(JSON.stringify(l))));
  }

  // --- Users ---
  getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): UserProfile | undefined {
    return this.users.get(id);
  }

  getUserByUsername(username: string): UserProfile | undefined {
    return Array.from(this.users.values()).find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserByEmail(email: string): UserProfile | undefined {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  saveUser(user: UserProfile): UserProfile {
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
    return user;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // --- Teams ---
  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  getTeamById(id: string): Team | undefined {
    return this.teams.get(id);
  }

  saveTeam(team: Team): Team {
    team.updatedAt = new Date().toISOString();
    this.teams.set(team.id, team);
    return team;
  }

  deleteTeam(id: string): boolean {
    return this.teams.delete(id);
  }

  // --- Opportunities ---
  getAllOpportunities(): Opportunity[] {
    return Array.from(this.opportunities.values());
  }

  getOpportunityById(id: string): Opportunity | undefined {
    return this.opportunities.get(id);
  }

  saveOpportunity(opp: Opportunity): Opportunity {
    this.opportunities.set(opp.id, opp);
    return opp;
  }

  deleteOpportunity(id: string): boolean {
    return this.opportunities.delete(id);
  }

  // --- Connections ---
  getAllConnections(): ConnectionAction[] {
    return Array.from(this.connections.values());
  }

  getConnectionsForUser(userId: string): ConnectionAction[] {
    return Array.from(this.connections.values()).filter(
      (c) => c.initiatorId === userId || c.receiverId === userId
    );
  }

  findConnectionBetween(userA: string, userB: string): ConnectionAction | undefined {
    return Array.from(this.connections.values()).find(
      (c) =>
        (c.initiatorId === userA && c.receiverId === userB) ||
        (c.initiatorId === userB && c.receiverId === userA)
    );
  }

  saveConnection(conn: ConnectionAction): ConnectionAction {
    conn.updatedAt = new Date().toISOString();
    this.connections.set(conn.id, conn);
    return conn;
  }

  // --- Messages & Conversations ---
  getConversationsForUser(userId: string): Conversation[] {
    return Array.from(this.conversations.values()).filter((c) =>
      c.participants.some((p) => p.id === userId)
    );
  }

  getConversationById(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  findConversationBetween(userA: string, userB: string): Conversation | undefined {
    return Array.from(this.conversations.values()).find(
      (c) =>
        c.participants.some((p) => p.id === userA) &&
        c.participants.some((p) => p.id === userB)
    );
  }

  saveConversation(conv: Conversation): Conversation {
    conv.updatedAt = new Date().toISOString();
    this.conversations.set(conv.id, conv);
    return conv;
  }

  getMessagesByConversationId(convId: string): ChatMessage[] {
    return Array.from(this.messages.values())
      .filter((m) => m.conversationId === convId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  saveMessage(msg: ChatMessage): ChatMessage {
    this.messages.set(msg.id, msg);
    // Update conversation lastMessage
    const conv = this.conversations.get(msg.conversationId);
    if (conv) {
      conv.lastMessage = msg;
      conv.updatedAt = msg.createdAt;
      this.conversations.set(conv.id, conv);
    }
    return msg;
  }

  // --- Notifications ---
  getNotificationsForUser(userId: string): NotificationItem[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveNotification(notif: NotificationItem): NotificationItem {
    this.notifications.set(notif.id, notif);
    return notif;
  }

  markNotificationRead(id: string): boolean {
    const notif = this.notifications.get(id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  // --- Moderation Reports ---
  getAllReports(): ModerationReport[] {
    return Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  saveReport(report: ModerationReport): ModerationReport {
    this.reports.set(report.id, report);
    return report;
  }

  // --- Audit Logs ---
  getAllAuditLogs(): AuditLogEntry[] {
    return Array.from(this.auditLogs.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  saveAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): AuditLogEntry {
    const log: AuditLogEntry = {
      ...entry,
      id: entry.id || `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      status: entry.status || 'success',
    };
    this.auditLogs.set(log.id, log);
    return log;
  }

  clearAuditLogs(): void {
    this.auditLogs.clear();
  }

  // --- Admin Stats ---
  getAdminStats(): AdminStats {
    const users = Array.from(this.users.values());
    const activeUsers = users.filter((u) => u.availability !== 'not_available').length;
    const conns = Array.from(this.connections.values());
    const acceptedConns = conns.filter((c) => c.status === 'accepted').length;

    return {
      totalUsers: users.length,
      activeUsers,
      totalTeams: this.teams.size,
      totalMatchesGenerated: users.length * 12 + 142,
      successfulConnections: acceptedConns,
      teamFormationsCount: 14,
      activeOpportunities: this.opportunities.size,
      pendingReports: Array.from(this.reports.values()).filter((r) => r.status === 'pending').length,
      systemHealth: {
        apiStatus: 'healthy',
        dbLatencyMs: 3.2,
        mlEngineLatencyMs: 14.8,
        redisCacheHitRate: 94.6,
        uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000) + 18240,
      },
      recommendationWeights: getEngineWeights(),
    };
  }
}

export const db = new DatabaseStore();
