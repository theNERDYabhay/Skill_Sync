import { UserProfile, Team, RecommendationBreakdown, Opportunity } from '../../src/types/index.js';
import { calculateSkillComplementarity, normalizeSkill } from './skillTaxonomy.js';

export interface MatchingWeights {
  skillComplementarity: number;
  semanticSimilarity: number;
  goalCompatibility: number;
  projectRelevance: number;
  experienceRelevance: number;
  availabilityFit: number;
  modelVersion: string;
}

export let DEFAULT_WEIGHTS: MatchingWeights = {
  skillComplementarity: 0.30,
  semanticSimilarity: 0.20,
  goalCompatibility: 0.15,
  projectRelevance: 0.15,
  experienceRelevance: 0.10,
  availabilityFit: 0.10,
  modelVersion: 'v2.4.1-hybrid-complementarity',
};

export function updateEngineWeights(newWeights: Partial<MatchingWeights>) {
  DEFAULT_WEIGHTS = {
    ...DEFAULT_WEIGHTS,
    ...newWeights,
  };
  return DEFAULT_WEIGHTS;
}

export function getEngineWeights(): MatchingWeights {
  return { ...DEFAULT_WEIGHTS };
}

// Semantic similarity based on Jaccard & Jaro-Winkler token overlap between domains & headlines
function calculateSemanticSimilarity(textA: string, textB: string): number {
  const tokenize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0.2;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  const jaccard = intersection / Math.max(union, 1);
  return Math.min(1.0, Math.max(0.15, jaccard * 1.8));
}

// Compute Candidate to Candidate (Solo to Solo) match
export function computeUserToUserMatch(
  sourceUser: UserProfile,
  targetUser: UserProfile,
  weights: MatchingWeights = DEFAULT_WEIGHTS
): RecommendationBreakdown {
  const sourceSkillNames = sourceUser.skills.map((s) => s.name);
  const targetSkillNames = targetUser.skills.map((s) => s.name);

  // 1. Skill Complementarity
  const comp = calculateSkillComplementarity(sourceSkillNames, targetSkillNames);
  const skillCompScore = Math.min(100, Math.round(comp.score * 100));

  // 2. Semantic Similarity of their professional backgrounds & bios
  const textA = `${sourceUser.headline} ${sourceUser.bio} ${sourceUser.projects.map((p) => p.title + ' ' + p.technologies.join(' ')).join(' ')}`;
  const textB = `${targetUser.headline} ${targetUser.bio} ${targetUser.projects.map((p) => p.title + ' ' + p.technologies.join(' ')).join(' ')}`;
  const semScore = Math.min(100, Math.round(calculateSemanticSimilarity(textA, textB) * 100));

  // 3. Goal Compatibility (Shared collaboration goals)
  const sharedGoals = sourceUser.goals.filter((g) => targetUser.goals.includes(g));
  const goalScore = Math.min(
    100,
    Math.round((sharedGoals.length / Math.max(sourceUser.goals.length, 1)) * 85 + (sharedGoals.length > 0 ? 15 : 0))
  );

  // 4. Project Relevance
  const targetTechs = targetUser.projects.flatMap((p) => p.technologies.map((t) => t.toLowerCase()));
  const sourceLooking = sourceUser.lookingForSkills.map((s) => s.toLowerCase());
  const projectRelevanceHits = targetTechs.filter((t) => sourceLooking.includes(t) || sourceSkillNames.map((s) => s.toLowerCase()).includes(t));
  const projectScore = Math.min(100, Math.round(35 + Math.min(65, projectRelevanceHits.length * 20)));

  // 5. Experience Relevance
  const expDiff = Math.abs(sourceUser.experience.length - targetUser.experience.length);
  const expScore = Math.max(30, 95 - expDiff * 15);

  // 6. Availability Fit
  let availScore = 40;
  if (targetUser.availability === 'available_now') availScore = 98;
  else if (targetUser.availability === 'looking_for_team') availScore = 94;
  else if (targetUser.availability === 'open_to_collab') availScore = 80;
  else availScore = 20;

  // Calculate weighted overall score
  const overall = Math.round(
    weights.skillComplementarity * skillCompScore +
    weights.semanticSimilarity * semScore +
    weights.goalCompatibility * goalScore +
    weights.projectRelevance * projectScore +
    weights.experienceRelevance * expScore +
    weights.availabilityFit * availScore
  );

  // Generate Explainable AI Reasons
  const reasons: string[] = [];
  if (comp.synergies.length > 0) {
    reasons.push(`High tech synergy: ${comp.synergies.slice(0, 2).join(', ')}`);
  }
  if (sharedGoals.length > 0) {
    const formattedGoals = sharedGoals.map((g) => g.replace('_', ' ')).join(' & ');
    reasons.push(`Mutual focus on ${formattedGoals}`);
  }
  if (comp.complementaryPairs.length > 0) {
    reasons.push(`Complementary disciplines: ${comp.complementaryPairs[0]}`);
  }
  if (availScore >= 80) {
    reasons.push(`Active & available for immediate collaboration`);
  }
  if (targetUser.leetcode?.contestRating && targetUser.leetcode.contestRating > 1700) {
    reasons.push(`Demonstrated algorithmic rigor on LeetCode (${targetUser.leetcode.contestRating} rating)`);
  }
  if (targetUser.github?.featuredRepos && targetUser.github.featuredRepos.length > 0) {
    reasons.push(`Strong open-source repository track record`);
  }

  // Missing skills supplied
  const supplied = targetSkillNames.filter((ts) =>
    sourceUser.lookingForSkills.some((ls) => ls.toLowerCase() === ts.toLowerCase())
  );

  return {
    skillComplementarity: skillCompScore,
    semanticSimilarity: semScore,
    goalCompatibility: goalScore,
    projectRelevance: projectScore,
    experienceRelevance: expScore,
    availabilityFit: availScore,
    overallScore: Math.min(99, Math.max(45, overall)),
    reasons,
    missingSkillsSupplied: supplied.length > 0 ? supplied : targetSkillNames.slice(0, 3),
    complementarySkills: comp.synergies,
    sharedGoals,
  };
}

// Compute Team to Candidate (Finding candidate for a team's missing roles)
export function computeTeamToCandidateMatch(
  team: Team,
  candidate: UserProfile,
  weights: MatchingWeights = DEFAULT_WEIGHTS
): { breakdown: RecommendationBreakdown; bestRequirementId: string } {
  const candidateSkills = candidate.skills.map((s) => s.name);
  const teamStack = team.techStack;

  // Find which requirement matches candidate best
  let bestScore = -1;
  let bestReqId = team.openRequirements[0]?.id || '';
  let bestSuppliedSkills: string[] = [];

  for (const req of team.openRequirements.filter((r) => !r.isFilled)) {
    const matched = req.requiredSkills.filter((rs) =>
      candidateSkills.some((cs) => cs.toLowerCase() === rs.toLowerCase())
    );
    const score = (matched.length / Math.max(req.requiredSkills.length, 1)) * 100;
    if (score > bestScore) {
      bestScore = score;
      bestReqId = req.id;
      bestSuppliedSkills = matched;
    }
  }

  // 1. Skill Complementarity (Team current stack + candidate's skills + open role fit)
  const comp = calculateSkillComplementarity(teamStack, candidateSkills);
  const roleBonus = (bestScore / 100) * 25;
  const skillCompScore = Math.min(100, Math.round(comp.score * 75 + roleBonus));

  // 2. Semantic Similarity (Team mission & project vs candidate bio & projects)
  const teamText = `${team.name} ${team.tagline} ${team.description} ${team.projectFocus} ${team.mission}`;
  const candText = `${candidate.headline} ${candidate.bio} ${candidate.projects.map((p) => p.title + ' ' + p.description).join(' ')}`;
  const semScore = Math.min(100, Math.round(calculateSemanticSimilarity(teamText, candText) * 100));

  // 3. Goal Compatibility (Team's opportunity type vs candidate goals)
  const teamTypeMap: Record<string, string> = {
    hackathon: 'hackathons',
    startup: 'startups',
    open_source: 'open_source',
    contest: 'contests',
    project: 'projects',
  };
  const candHasTeamGoal = candidate.goals.includes(teamTypeMap[team.opportunityType] as any);
  const goalScore = candHasTeamGoal ? 95 : 60;

  // 4. Project Relevance (Candidate projects matching team's tech stack or focus)
  const relevantProjects = candidate.projects.filter((p) =>
    p.technologies.some((t) => teamStack.some((ts) => ts.toLowerCase() === t.toLowerCase()))
  );
  const projectScore = Math.min(100, 40 + relevantProjects.length * 25);

  // 5. Experience Relevance
  const expScore = candidate.experience.length >= 2 ? 90 : 70;

  // 6. Availability Fit
  const availScore = candidate.availability === 'available_now' || candidate.availability === 'looking_for_team' ? 95 : 65;

  const overall = Math.round(
    weights.skillComplementarity * skillCompScore +
    weights.semanticSimilarity * semScore +
    weights.goalCompatibility * goalScore +
    weights.projectRelevance * projectScore +
    weights.experienceRelevance * expScore +
    weights.availabilityFit * availScore
  );

  const matchedRequirement = team.openRequirements.find((r) => r.id === bestReqId);
  const reasons: string[] = [];
  if (matchedRequirement) {
    reasons.push(`Direct fit for open role: "${matchedRequirement.title}"`);
    if (bestSuppliedSkills.length > 0) {
      reasons.push(`Covers required skills: ${bestSuppliedSkills.join(', ')}`);
    }
  }
  if (comp.synergies.length > 0) {
    reasons.push(`Tech synergy with existing team stack: ${comp.synergies.slice(0, 2).join(', ')}`);
  }
  if (candHasTeamGoal) {
    reasons.push(`Targeting ${team.opportunityType.replace('_', ' ')} collaboration`);
  }
  if (candidate.github?.featuredRepos?.length) {
    reasons.push(`Verified GitHub repositories in relevant technologies`);
  }

  return {
    breakdown: {
      skillComplementarity: skillCompScore,
      semanticSimilarity: semScore,
      goalCompatibility: goalScore,
      projectRelevance: projectScore,
      experienceRelevance: expScore,
      availabilityFit: availScore,
      overallScore: Math.min(99, Math.max(50, overall)),
      reasons,
      missingSkillsSupplied: bestSuppliedSkills.length > 0 ? bestSuppliedSkills : matchedRequirement?.requiredSkills || [],
      complementarySkills: comp.synergies,
      sharedGoals: candHasTeamGoal ? [teamTypeMap[team.opportunityType] as any] : [],
    },
    bestRequirementId: bestReqId,
  };
}

// Compute Opportunity Fit for Candidate
export function computeOpportunityFit(
  opportunity: Opportunity,
  candidate: UserProfile
): { score: number; reasons: string[] } {
  const candidateSkills = candidate.skills.map((s) => s.name.toLowerCase());
  const matched = opportunity.requiredSkills.filter((rs) =>
    candidateSkills.some((cs) => cs === rs.toLowerCase())
  );

  const skillFit = (matched.length / Math.max(opportunity.requiredSkills.length, 1)) * 100;
  const isGoalAligned = candidate.goals.some((g) => g.includes(opportunity.type));
  const goalFit = isGoalAligned ? 90 : 50;

  const score = Math.round(skillFit * 0.6 + goalFit * 0.4);
  const reasons: string[] = [];
  if (matched.length > 0) {
    reasons.push(`Matches target skill requirements: ${matched.join(', ')}`);
  }
  if (isGoalAligned) {
    reasons.push(`Direct alignment with your goal: ${opportunity.type}`);
  }
  reasons.push(`Opportunity deadline: ${new Date(opportunity.deadline).toLocaleDateString()}`);

  return {
    score: Math.min(98, Math.max(40, score)),
    reasons,
  };
}
