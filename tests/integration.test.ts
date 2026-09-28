import { db } from '../server/services/db.js';
import { updateEngineWeights, getEngineWeights } from '../server/services/matchingEngine.js';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${msg}`);
  }
}

console.log('=== RUNNING SKILLSYNC INTEGRATION TESTS ===\n');

// 1. User Retrieval & Seed Verification
console.log('--- Testing Database User Store ---');
const users = db.getAllUsers();
assert(users.length >= 8, `Database initialized with rich seed users (count: ${users.length})`);

const alex = db.getUserById('usr-2');
assert(alex !== undefined && alex.name === 'Alex Rivera', 'Retrieved Alex Rivera by ID');
assert(alex?.skills.length! >= 5, 'User has full skills portfolio');

// 2. Mutual Connection Flow
console.log('\n--- Testing Mutual Connection State Machine ---');
// User 1 requests connection with User 3
let newConn = db.saveConnection({
  id: `conn-test-${Date.now()}`,
  initiatorId: 'usr-1',
  receiverId: 'usr-3',
  status: 'pending',
  message: 'Let us build together',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  initiator: { id: 'usr-1', name: 'Sarah Chen', avatar: '', headline: '' },
  receiver: { id: 'usr-3', name: 'Marcus Vance', avatar: '', headline: '' },
});
assert(newConn.status === 'pending', 'Connection created in pending status');

// Recipient accepts
newConn.status = 'accepted';
db.saveConnection(newConn);
const verifiedConn = db.findConnectionBetween('usr-1', 'usr-3');
assert(verifiedConn?.status === 'accepted', 'Connection updated to accepted status');

// 3. Team Management & Open Roles
console.log('\n--- Testing Team Open Role Lifecycle ---');
const teams = db.getAllTeams();
assert(teams.length >= 3, `Teams seeded properly (count: ${teams.length})`);

const team = teams[0];
const initialReqCount = team.openRequirements.length;
team.openRequirements.push({
  id: `req-test-${Date.now()}`,
  title: 'Cloud DevOps Engineer',
  description: 'Deploy Kubernetes clusters',
  requiredSkills: ['Docker', 'Kubernetes', 'AWS Cloud'],
  proficiencyNeeded: 'advanced',
  isFilled: false,
  appliedCount: 0,
});
db.saveTeam(team);

const reloadedTeam = db.getTeamById(team.id);
assert(reloadedTeam?.openRequirements.length === initialReqCount + 1, 'Added open requirement to team');

// 4. Recommendation Engine Live Weight Tuning
console.log('\n--- Testing Live Recommendation Weight Calibration ---');
const initialWeights = getEngineWeights();
assert(initialWeights.skillComplementarity === 0.30, 'Initial complementarity weight is 0.30');

updateEngineWeights({ skillComplementarity: 0.40 });
const updatedWeights = getEngineWeights();
assert(updatedWeights.skillComplementarity === 0.40, 'Successfully updated engine weight to 0.40');

// Restore weights
updateEngineWeights({ skillComplementarity: 0.30 });

console.log('\n========================================');
console.log('🎉 ALL SKILLSYNC INTEGRATION TESTS PASSED SUCCESSFULLY!');
console.log('========================================\n');
