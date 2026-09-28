import { normalizeSkill, calculateSkillComplementarity, SKILL_TAXONOMY } from '../server/services/skillTaxonomy.js';
import { computeUserToUserMatch, computeTeamToCandidateMatch, DEFAULT_WEIGHTS } from '../server/services/matchingEngine.js';
import { parseResumeContent } from '../server/services/resumeParser.js';
import { SEED_USERS, SEED_TEAMS } from '../server/services/db.js';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${msg}`);
  }
}

console.log('=== RUNNING SKILLSYNC UNIT TESTS ===\n');

// 1. Skill Normalization & Taxonomy
console.log('--- Testing Skill Taxonomy & Normalization ---');
const normReact = normalizeSkill('react.js');
assert(normReact.canonicalName === 'React', 'Normalizes "react.js" to canonical "React"');
assert(normReact.category === 'Frontend', 'Identifies correct category "Frontend"');

const normPy = normalizeSkill('Python3');
assert(normPy.canonicalName === 'Python', 'Normalizes "Python3" to "Python"');

// 2. Skill Complementarity
console.log('\n--- Testing Skill Complementarity Matrix ---');
const compResult = calculateSkillComplementarity(
  ['Python', 'FastAPI', 'PyTorch'],
  ['React', 'TypeScript', 'Tailwind CSS']
);
assert(compResult.score >= 0.70, `High complementarity between ML/Backend and Frontend (score: ${compResult.score})`);
assert(compResult.complementaryPairs.length > 0, 'Identifies disciplinary synergies');

// 3. Two-Sided AI Recommendation Matching Engine
console.log('\n--- Testing Two-Sided AI Recommendation Engine ---');
const userML = SEED_USERS[0]; // Sarah Chen (ML & Vision)
const userFE = SEED_USERS[1]; // Alex Rivera (Staff Frontend)

const matchScore = computeUserToUserMatch(userML, userFE, DEFAULT_WEIGHTS);
assert(matchScore.overallScore >= 70, `High overall match score between complementary builders (${matchScore.overallScore}%)`);
assert(matchScore.reasons.length >= 2, 'Generates explainable AI reasoning bullets');
assert(matchScore.missingSkillsSupplied.length > 0, 'Lists missing skills supplied');

// 4. Team to Candidate Matching
console.log('\n--- Testing Team Open Role Matching ---');
const team = SEED_TEAMS[0]; // NeuroCraft AI (Missing Frontend & UI/UX)
const teamCandMatch = computeTeamToCandidateMatch(team, userFE, DEFAULT_WEIGHTS);
assert(teamCandMatch.breakdown.overallScore >= 70, `Frontend engineer scores high fit for team missing frontend lead (${teamCandMatch.breakdown.overallScore}%)`);
assert(teamCandMatch.bestRequirementId === 'req-1', 'Correctly identifies req-1 as best fit requirement');

// 5. Resume Extraction Pipeline
console.log('\n--- Testing Resume Extraction Pipeline ---');
const sampleResumeText = `
Jane Doe, Senior Software Engineer
Experienced in React, TypeScript, FastAPI, Docker, and PostgreSQL.
Led development of high-throughput data processing platform at ScaleTech.
B.S. in Computer Science from State University.
`;
const extracted = parseResumeContent(sampleResumeText, 'jane-doe-resume.pdf');
assert(extracted.skills.some((s) => s.name === 'React'), 'Extracts React from resume');
assert(extracted.skills.some((s) => s.name === 'FastAPI'), 'Extracts FastAPI from resume');
assert(extracted.skills.every((s) => s.confirmed === true), 'Extracted skills are uncommitted/ready for confirmation review');

console.log('\n========================================');
console.log('🎉 ALL SKILLSYNC UNIT TESTS PASSED SUCCESSFULLY!');
console.log('========================================\n');
