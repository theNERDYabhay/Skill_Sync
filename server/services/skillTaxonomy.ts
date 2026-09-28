import { SkillCategory } from '../../src/types/index.js';

export interface SkillDefinition {
  canonicalName: string;
  category: SkillCategory;
  aliases: string[];
  complementaryCategories: SkillCategory[];
  synergies: string[];
}

export const SKILL_TAXONOMY: Record<string, SkillDefinition> = {
  // Frontend
  react: {
    canonicalName: 'React',
    category: 'Frontend',
    aliases: ['reactjs', 'react.js', 'react-dom'],
    complementaryCategories: ['Backend', 'UI/UX', 'Mobile'],
    synergies: ['Node.js', 'FastAPI', 'Figma', 'TypeScript', 'GraphQL', 'Tailwind CSS'],
  },
  typescript: {
    canonicalName: 'TypeScript',
    category: 'Programming',
    aliases: ['ts'],
    complementaryCategories: ['Backend', 'Frontend'],
    synergies: ['React', 'Node.js', 'Next.js', 'NestJS'],
  },
  nextjs: {
    canonicalName: 'Next.js',
    category: 'Frontend',
    aliases: ['next', 'next.js'],
    complementaryCategories: ['Backend', 'UI/UX', 'Cloud'],
    synergies: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Supabase'],
  },
  vue: {
    canonicalName: 'Vue.js',
    category: 'Frontend',
    aliases: ['vue', 'vuejs', 'vue 3'],
    complementaryCategories: ['Backend', 'UI/UX'],
    synergies: ['Node.js', 'Tailwind CSS', 'Figma'],
  },
  tailwind: {
    canonicalName: 'Tailwind CSS',
    category: 'Frontend',
    aliases: ['tailwindcss', 'tailwind'],
    complementaryCategories: ['Backend', 'UI/UX'],
    synergies: ['React', 'Next.js', 'Figma', 'UI/UX'],
  },

  // Backend
  python: {
    canonicalName: 'Python',
    category: 'Programming',
    aliases: ['python3', 'py'],
    complementaryCategories: ['Frontend', 'UI/UX', 'DevOps'],
    synergies: ['FastAPI', 'PyTorch', 'Django', 'React', 'Docker'],
  },
  fastapi: {
    canonicalName: 'FastAPI',
    category: 'Backend',
    aliases: ['fast-api'],
    complementaryCategories: ['Frontend', 'UI/UX', 'Mobile'],
    synergies: ['Python', 'React', 'Docker', 'PostgreSQL', 'Redis'],
  },
  nodejs: {
    canonicalName: 'Node.js',
    category: 'Backend',
    aliases: ['node', 'nodejs', 'express', 'nestjs'],
    complementaryCategories: ['Frontend', 'UI/UX', 'DevOps'],
    synergies: ['TypeScript', 'React', 'PostgreSQL', 'MongoDB', 'Redis'],
  },
  go: {
    canonicalName: 'Go (Golang)',
    category: 'Backend',
    aliases: ['golang', 'go'],
    complementaryCategories: ['Frontend', 'DevOps', 'UI/UX'],
    synergies: ['Kubernetes', 'Docker', 'gRPC', 'PostgreSQL', 'React'],
  },
  rust: {
    canonicalName: 'Rust',
    category: 'Programming',
    aliases: ['rustlang'],
    complementaryCategories: ['Frontend', 'UI/UX'],
    synergies: ['WebAssembly', 'Solidity', 'C++', 'React'],
  },
  postgresql: {
    canonicalName: 'PostgreSQL',
    category: 'Backend',
    aliases: ['postgres', 'psql'],
    complementaryCategories: ['Frontend', 'UI/UX'],
    synergies: ['Prisma', 'Drizzle', 'FastAPI', 'Node.js', 'Go (Golang)'],
  },
  redis: {
    canonicalName: 'Redis',
    category: 'Backend',
    aliases: ['redis-cache'],
    complementaryCategories: ['Frontend', 'DevOps'],
    synergies: ['Node.js', 'FastAPI', 'Go (Golang)', 'Celery'],
  },

  // AI & ML
  machine_learning: {
    canonicalName: 'Machine Learning',
    category: 'AI/ML',
    aliases: ['ml', 'scikit-learn', 'deep learning'],
    complementaryCategories: ['Frontend', 'UI/UX', 'Product', 'Backend'],
    synergies: ['Python', 'React', 'FastAPI', 'PyTorch', 'Data Science'],
  },
  pytorch: {
    canonicalName: 'PyTorch',
    category: 'AI/ML',
    aliases: ['torch'],
    complementaryCategories: ['Frontend', 'Backend', 'DevOps'],
    synergies: ['Python', 'CUDA', 'FastAPI', 'Hugging Face', 'Computer Vision'],
  },
  nlp: {
    canonicalName: 'NLP & LLMs',
    category: 'AI/ML',
    aliases: ['natural language processing', 'llm', 'langchain', 'transformers'],
    complementaryCategories: ['Frontend', 'UI/UX', 'Product'],
    synergies: ['Python', 'FastAPI', 'React', 'Vector Databases', 'Prompt Engineering'],
  },
  computer_vision: {
    canonicalName: 'Computer Vision',
    category: 'AI/ML',
    aliases: ['cv', 'opencv', 'yolo'],
    complementaryCategories: ['Frontend', 'Mobile', 'UI/UX'],
    synergies: ['PyTorch', 'Python', 'React', 'Jetpack Compose'],
  },

  // Design & UI/UX
  figma: {
    canonicalName: 'Figma',
    category: 'UI/UX',
    aliases: ['figma design', 'figma prototyping'],
    complementaryCategories: ['Frontend', 'Backend', 'AI/ML', 'Mobile'],
    synergies: ['React', 'Design Systems', 'Tailwind CSS', 'User Research'],
  },
  ui_ux: {
    canonicalName: 'UI/UX Design',
    category: 'UI/UX',
    aliases: ['ux', 'ui', 'user experience', 'interaction design'],
    complementaryCategories: ['Frontend', 'Backend', 'AI/ML', 'Product'],
    synergies: ['Figma', 'React', 'Design Systems', 'Prototyping'],
  },
  design_systems: {
    canonicalName: 'Design Systems',
    category: 'UI/UX',
    aliases: ['design system', 'component library'],
    complementaryCategories: ['Frontend', 'Product'],
    synergies: ['Figma', 'React', 'Tailwind CSS', 'Storybook'],
  },

  // Mobile
  kotlin: {
    canonicalName: 'Kotlin',
    category: 'Mobile',
    aliases: ['kotlin/android', 'android kotlin'],
    complementaryCategories: ['Backend', 'UI/UX', 'Cloud'],
    synergies: ['Jetpack Compose', 'FastAPI', 'Node.js', 'Figma'],
  },
  jetpack_compose: {
    canonicalName: 'Jetpack Compose',
    category: 'Mobile',
    aliases: ['compose', 'android compose'],
    complementaryCategories: ['Backend', 'UI/UX'],
    synergies: ['Kotlin', 'Coroutines', 'Retrofit', 'Figma'],
  },
  flutter: {
    canonicalName: 'Flutter',
    category: 'Mobile',
    aliases: ['dart/flutter'],
    complementaryCategories: ['Backend', 'UI/UX'],
    synergies: ['Dart', 'Firebase', 'Figma', 'Node.js'],
  },

  // Cloud & DevOps
  docker: {
    canonicalName: 'Docker',
    category: 'DevOps',
    aliases: ['containerization', 'containers'],
    complementaryCategories: ['Frontend', 'AI/ML', 'Product'],
    synergies: ['Kubernetes', 'FastAPI', 'Node.js', 'AWS'],
  },
  kubernetes: {
    canonicalName: 'Kubernetes',
    category: 'Cloud',
    aliases: ['k8s'],
    complementaryCategories: ['Frontend', 'AI/ML'],
    synergies: ['Docker', 'Go (Golang)', 'Terraform', 'AWS'],
  },
  aws: {
    canonicalName: 'AWS Cloud',
    category: 'Cloud',
    aliases: ['amazon web services', 'aws'],
    complementaryCategories: ['Frontend', 'UI/UX'],
    synergies: ['Docker', 'Terraform', 'FastAPI', 'Node.js'],
  },

  // Product & Business
  product_management: {
    canonicalName: 'Product Management',
    category: 'Product',
    aliases: ['pm', 'product strategy', 'product lead'],
    complementaryCategories: ['Frontend', 'Backend', 'AI/ML', 'UI/UX'],
    synergies: ['User Research', 'Agile', 'Market Analysis', 'Figma'],
  },
  user_research: {
    canonicalName: 'User Research',
    category: 'UI/UX',
    aliases: ['ux research', 'usability testing'],
    complementaryCategories: ['Frontend', 'Product', 'AI/ML'],
    synergies: ['Figma', 'Product Management', 'Analytics'],
  },

  // Security & Blockchain
  cybersecurity: {
    canonicalName: 'Cybersecurity',
    category: 'Security',
    aliases: ['infosec', 'penetration testing', 'security audit'],
    complementaryCategories: ['Backend', 'Cloud', 'DevOps'],
    synergies: ['Rust', 'Python', 'Linux', 'Network Security'],
  },
  solidity: {
    canonicalName: 'Solidity',
    category: 'Programming',
    aliases: ['ethereum', 'smart contracts', 'web3'],
    complementaryCategories: ['Frontend', 'UI/UX', 'Security'],
    synergies: ['React', 'TypeScript', 'Ethers.js', 'Hardhat'],
  },
};

export function normalizeSkill(input: string): SkillDefinition {
  const clean = input.trim().toLowerCase();
  for (const [key, def] of Object.entries(SKILL_TAXONOMY)) {
    if (key === clean || def.canonicalName.toLowerCase() === clean) {
      return def;
    }
    if (def.aliases.some((alias) => alias.toLowerCase() === clean)) {
      return def;
    }
  }

  // Fallback inferred
  return {
    canonicalName: input.trim(),
    category: 'Programming',
    aliases: [],
    complementaryCategories: ['Frontend', 'Backend', 'UI/UX'],
    synergies: [],
  };
}

export function calculateSkillComplementarity(
  skillsA: string[],
  skillsB: string[]
): { score: number; synergies: string[]; complementaryPairs: string[] } {
  if (!skillsA.length || !skillsB.length) {
    return { score: 0.2, synergies: [], complementaryPairs: [] };
  }

  const defsA = skillsA.map(normalizeSkill);
  const defsB = skillsB.map(normalizeSkill);

  const categoriesA = new Set(defsA.map((d) => d.category));
  const categoriesB = new Set(defsB.map((d) => d.category));

  let complementarityHits = 0;
  let totalChecks = 0;
  const synergiesFound: string[] = [];
  const complementaryPairs: string[] = [];

  for (const a of defsA) {
    for (const b of defsB) {
      totalChecks++;
      // High synergy when one belongs to complementary category of another
      if (a.complementaryCategories.includes(b.category)) {
        complementarityHits += 1.5;
        if (complementaryPairs.length < 4) {
          complementaryPairs.push(`${a.canonicalName} (${a.category}) + ${b.canonicalName} (${b.category})`);
        }
      }
      // Direct synergy list check
      if (a.synergies.some((s) => s.toLowerCase() === b.canonicalName.toLowerCase())) {
        complementarityHits += 2;
        if (!synergiesFound.includes(`${a.canonicalName} & ${b.canonicalName}`)) {
          synergiesFound.push(`${a.canonicalName} & ${b.canonicalName}`);
        }
      }
    }
  }

  // Check category diversity bonus: having complementary disciplines (e.g. Backend + Frontend + Design)
  const unionCategories = new Set([...categoriesA, ...categoriesB]);
  const diversityRatio = unionCategories.size / Math.max(categoriesA.size, categoriesB.size, 1);

  const rawScore = totalChecks > 0 ? (complementarityHits / (totalChecks * 1.2)) : 0.5;
  const boundedScore = Math.min(1.0, Math.max(0.1, (rawScore * 0.7) + (diversityRatio * 0.3)));

  return {
    score: Math.round(boundedScore * 100) / 100,
    synergies: synergiesFound,
    complementaryPairs,
  };
}
