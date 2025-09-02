// Study-related constants and color mappings

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const getSubjectColor = (subject: string) => {
  const colors = {
    'Biology': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Chemistry': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Physics': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Math': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'History': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'Computer Science': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'General': 'bg-muted text-muted-foreground'
  };
  return colors[subject as keyof typeof colors] || 'bg-muted text-muted-foreground';
};

// Flashcard Performance Tracking Types
export type PerformanceLevel = 'new' | 'learning' | 'familiar' | 'mastered';
export type StudyResult = 'correct' | 'incorrect' | 'easy' | 'hard';

export interface CardPerformance {
  timesStudied: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastStudied?: Date;
  currentLevel: PerformanceLevel;
  averageResponseTime: number; // in seconds
  consecutiveCorrect: number;
  needsReview: boolean;
}

// Flashcard Decks (organized by subject with performance tracking)
export const mockFlashcardDecks = [
  {
    id: 1,
    title: "Biology Fundamentals",
    subject: "Biology",
    cardCount: 12,
    difficulty: "Medium" as const,
    description: "Essential biology concepts covering cell structure, genetics, and basic processes",
    lastStudied: "2 hours ago",
    progress: 85,
    cards: [
      {
        id: 1,
        front: "What is the function of mitochondria?",
        back: "Mitochondria are the powerhouse of the cell, responsible for producing ATP through cellular respiration. They convert glucose and oxygen into usable energy for cellular processes.",
        isFlipped: false,
        performance: {
          timesStudied: 8,
          timesCorrect: 6,
          timesIncorrect: 2,
          lastStudied: new Date(Date.now() - 3600000), // 1 hour ago
          currentLevel: 'familiar' as PerformanceLevel,
          averageResponseTime: 12,
          consecutiveCorrect: 2,
          needsReview: false
        }
      },
      {
        id: 2,
        front: "Define photosynthesis and write its equation",
        back: "Photosynthesis is the process by which plants convert light energy into chemical energy (glucose). Equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
        isFlipped: false,
        performance: {
          timesStudied: 12,
          timesCorrect: 10,
          timesIncorrect: 2,
          lastStudied: new Date(Date.now() - 7200000), // 2 hours ago
          currentLevel: 'mastered' as PerformanceLevel,
          averageResponseTime: 8,
          consecutiveCorrect: 5,
          needsReview: false
        }
      },
      {
        id: 3,
        front: "What are the four main types of biomolecules?",
        back: "1. Carbohydrates (energy storage and structure), 2. Lipids (cell membranes and energy), 3. Proteins (enzymes and structure), 4. Nucleic acids (DNA and RNA)",
        isFlipped: false,
        performance: {
          timesStudied: 4,
          timesCorrect: 2,
          timesIncorrect: 2,
          lastStudied: new Date(Date.now() - 86400000), // 1 day ago
          currentLevel: 'learning' as PerformanceLevel,
          averageResponseTime: 18,
          consecutiveCorrect: 0,
          needsReview: true
        }
      },
      {
        id: 4,
        front: "Describe the structure and function of DNA",
        back: "DNA is a double helix made of nucleotides containing adenine, thymine, guanine, and cytosine. It stores genetic information and serves as instructions for protein synthesis.",
        isFlipped: false,
        performance: {
          timesStudied: 0,
          timesCorrect: 0,
          timesIncorrect: 0,
          lastStudied: undefined,
          currentLevel: 'new' as PerformanceLevel,
          averageResponseTime: 0,
          consecutiveCorrect: 0,
          needsReview: false
        }
      }
    ]
  },
  {
    id: 2,
    title: "Chemistry Basics",
    subject: "Chemistry",
    cardCount: 10,
    difficulty: "Easy" as const,
    description: "Fundamental chemistry concepts including atomic structure and chemical bonding",
    lastStudied: "1 day ago",
    progress: 92,
    cards: [
      {
        id: 5,
        front: "What is the periodic table organized by?",
        back: "The periodic table is organized by atomic number (number of protons). Elements are arranged in periods (rows) and groups (columns) based on similar properties.",
        isFlipped: false,
        performance: {
          timesStudied: 6,
          timesCorrect: 6,
          timesIncorrect: 0,
          lastStudied: new Date(Date.now() - 86400000), // 1 day ago
          currentLevel: 'mastered' as PerformanceLevel,
          averageResponseTime: 6,
          consecutiveCorrect: 6,
          needsReview: false
        }
      },
      {
        id: 6,
        front: "Explain the difference between ionic and covalent bonds",
        back: "Ionic bonds form when electrons are transferred between atoms (metal + nonmetal), while covalent bonds form when electrons are shared between atoms (nonmetal + nonmetal).",
        isFlipped: false,
        performance: {
          timesStudied: 5,
          timesCorrect: 3,
          timesIncorrect: 2,
          lastStudied: new Date(Date.now() - 172800000), // 2 days ago
          currentLevel: 'learning' as PerformanceLevel,
          averageResponseTime: 15,
          consecutiveCorrect: 1,
          needsReview: true
        }
      },
      {
        id: 7,
        front: "What is Avogadro's number and what does it represent?",
        back: "Avogadro's number is 6.022 × 10²³. It represents the number of particles (atoms, molecules) in one mole of a substance.",
        isFlipped: false,
        performance: {
          timesStudied: 3,
          timesCorrect: 2,
          timesIncorrect: 1,
          lastStudied: new Date(Date.now() - 259200000), // 3 days ago
          currentLevel: 'learning' as PerformanceLevel,
          averageResponseTime: 20,
          consecutiveCorrect: 1,
          needsReview: false
        }
      }
    ]
  },
  {
    id: 3,
    title: "Physics Fundamentals",
    subject: "Physics",
    cardCount: 8,
    difficulty: "Hard" as const,
    description: "Core physics principles including Newton's laws and thermodynamics",
    lastStudied: "3 days ago",
    progress: 67,
    cards: [
      {
        id: 8,
        front: "State Newton's Three Laws of Motion",
        back: "1st Law (Inertia): Objects at rest stay at rest, objects in motion stay in motion unless acted upon by force. 2nd Law: F = ma. 3rd Law: For every action, there is an equal and opposite reaction.",
        isFlipped: false
      },
      {
        id: 9,
        front: "What is the First Law of Thermodynamics?",
        back: "Energy cannot be created or destroyed, only transferred or converted from one form to another. ΔU = Q - W (change in internal energy = heat added - work done by system).",
        isFlipped: false
      }
    ]
  },
  {
    id: 4,
    title: "Algebra Essentials",
    subject: "Math",
    cardCount: 15,
    difficulty: "Medium" as const,
    description: "Essential algebraic concepts and formulas for problem solving",
    lastStudied: "5 days ago",
    progress: 73,
    cards: [
      {
        id: 10,
        front: "What is the quadratic formula?",
        back: "x = (-b ± √(b² - 4ac)) / 2a, used to solve quadratic equations of the form ax² + bx + c = 0. The discriminant (b² - 4ac) determines the nature of roots.",
        isFlipped: false
      },
      {
        id: 11,
        front: "Explain the slope-intercept form of a line",
        back: "y = mx + b, where m is the slope (rise/run) and b is the y-intercept (where the line crosses the y-axis).",
        isFlipped: false
      }
    ]
  },
  {
    id: 5,
    title: "World War II",
    subject: "History",
    cardCount: 20,
    difficulty: "Easy" as const,
    description: "Key events, dates, and figures from World War II",
    lastStudied: "1 week ago",
    progress: 95,
    cards: [
      {
        id: 12,
        front: "When did World War II begin and end?",
        back: "WWII began on September 1, 1939 (Germany invaded Poland) and ended on September 2, 1945 (Japan's formal surrender aboard USS Missouri).",
        isFlipped: false
      },
      {
        id: 13,
        front: "What was D-Day and when did it occur?",
        back: "D-Day was the Allied invasion of Normandy, France on June 6, 1944. It opened the Western Front in Europe and marked the beginning of the end for Nazi Germany.",
        isFlipped: false
      }
    ]
  }
];

// Enhanced Notes with substantial content
export const mockNotes = [
  {
    id: 1,
    title: 'Cell Biology - Structure and Function',
    content: `# Cell Biology: Structure and Function

## Introduction
Cells are the fundamental units of life. All living organisms are composed of one or more cells, and all cells arise from pre-existing cells.

## Cell Types
### Prokaryotic Cells
- No membrane-bound nucleus
- DNA freely floating in cytoplasm
- Examples: Bacteria, Archaea
- Simpler internal organization

### Eukaryotic Cells
- Membrane-bound nucleus
- Complex internal organization
- Examples: Plant, Animal, Fungal cells
- Multiple organelles with specific functions

## Key Organelles

### Nucleus
- Control center of the cell
- Contains DNA and chromosomes
- Surrounded by nuclear envelope
- Site of transcription (DNA → RNA)

### Mitochondria
- "Powerhouse of the cell"
- Site of cellular respiration
- Produces ATP (adenosine triphosphate)
- Has its own DNA (maternal inheritance)

### Ribosomes
- Protein synthesis machinery
- Free-floating or attached to ER
- Composed of rRNA and proteins
- Site of translation (RNA → Protein)

### Endoplasmic Reticulum (ER)
- **Rough ER**: Has ribosomes, protein synthesis
- **Smooth ER**: No ribosomes, lipid synthesis

### Golgi Apparatus
- Processes and packages proteins
- Modifies proteins from ER
- Ships products to destinations

## Cell Membrane
- Phospholipid bilayer
- Selectively permeable
- Controls what enters/exits cell
- Contains proteins for transport

## Study Tips
1. Draw and label cell diagrams
2. Compare prokaryotic vs eukaryotic
3. Understand organelle functions
4. Practice identifying structures`,
    subject: 'Biology',
    tags: ['cells', 'organelles', 'membrane', 'prokaryotic', 'eukaryotic'],
    lastModified: '2 hours ago',
    wordCount: 245
  },
  {
    id: 2,
    title: 'Chemical Bonding and Molecular Structure',
    content: `# Chemical Bonding and Molecular Structure

## Types of Chemical Bonds

### Ionic Bonds
- Formation: Metal + Non-metal
- Electron transfer (not sharing)
- Creates charged ions (cations and anions)
- Examples: NaCl, MgO, CaF₂
- Properties: High melting points, conduct electricity when dissolved

### Covalent Bonds
- Formation: Non-metal + Non-metal
- Electron sharing between atoms
- Types:
  - **Single bond**: 2 electrons shared (H-H)
  - **Double bond**: 4 electrons shared (O=O)
  - **Triple bond**: 6 electrons shared (N≡N)

### Metallic Bonds
- Formation: Metal + Metal
- "Sea of electrons" model
- Electrons delocalized across metal atoms
- Properties: Conductivity, malleability, ductility

## Lewis Structures
1. Count total valence electrons
2. Draw skeletal structure
3. Complete octets (duet for hydrogen)
4. Check formal charges

## VSEPR Theory
Predicts molecular geometry based on electron pair repulsion:
- Linear (2 pairs): BeF₂
- Trigonal planar (3 pairs): BF₃
- Tetrahedral (4 pairs): CH₄
- Trigonal bipyramidal (5 pairs): PF₅
- Octahedral (6 pairs): SF₆

## Intermolecular Forces
1. **Van der Waals forces**: Weak attractions
2. **Dipole-dipole interactions**: Between polar molecules
3. **Hydrogen bonding**: H attached to N, O, or F
4. **London dispersion forces**: All molecules

## Practice Problems
- Draw Lewis structures for H₂O, CO₂, NH₃
- Predict molecular geometries
- Identify intermolecular forces`,
    subject: 'Chemistry',
    tags: ['bonding', 'ionic', 'covalent', 'VSEPR', 'Lewis structures'],
    lastModified: '1 day ago',
    wordCount: 298
  },
  {
    id: 3,
    title: 'World War II: Timeline and Major Events',
    content: `# World War II: Timeline and Major Events (1939-1945)

## Pre-War Context
- Treaty of Versailles (1919) created tensions
- Rise of fascism in Germany, Italy, Japan
- Economic instability from Great Depression
- Failure of League of Nations

## Major Timeline

### 1939
- **September 1**: Germany invades Poland → Britain and France declare war
- **September 17**: Soviet Union invades Poland from east
- **November 30**: Soviet Union attacks Finland (Winter War)

### 1940
- **April 9**: Germany invades Norway and Denmark
- **May 10**: Germany begins Western offensive (Belgium, Netherlands, France)
- **June 22**: France surrenders
- **July-October**: Battle of Britain (air war)

### 1941
- **June 22**: Operation Barbarossa - Germany invades Soviet Union
- **December 7**: Pearl Harbor attack → US enters war
- **December 11**: Germany declares war on US

### 1942
- **June 4-7**: Battle of Midway (turning point in Pacific)
- **August-February 1943**: Battle of Stalingrad (turning point in Europe)
- **October-November**: Second Battle of El Alamein (North Africa)

### 1943
- **July**: Battle of Kursk (largest tank battle)
- **September**: Italy surrenders (but German resistance continues)
- **November**: Tehran Conference (Big Three meet)

### 1944
- **June 6**: D-Day - Allied invasion of Normandy
- **June-August**: Soviet Operation Bagration destroys Army Group Center
- **August 25**: Liberation of Paris
- **December**: Battle of the Bulge (last German offensive)

### 1945
- **February**: Yalta Conference
- **April 12**: Roosevelt dies, Truman becomes president
- **April 30**: Hitler commits suicide
- **May 8**: VE Day - Germany surrenders
- **August 6 & 9**: Atomic bombs on Hiroshima and Nagasaki
- **September 2**: Japan surrenders → VJ Day

## Key Figures
- **Allied Leaders**: Churchill, Roosevelt, Stalin
- **Axis Leaders**: Hitler, Mussolini, Hirohito
- **Military**: Eisenhower, Rommel, Zhukov, MacArthur

## Major Theaters
1. **European Theater**: Western and Eastern Fronts
2. **Pacific Theater**: Naval warfare, island hopping
3. **Mediterranean Theater**: North Africa, Italy
4. **Home Fronts**: Civilian involvement, war production

## Consequences
- ~70-85 million deaths
- United Nations established
- Beginning of Cold War
- Decolonization movement
- Nuclear age begins`,
    subject: 'History',
    tags: ['WWII', 'timeline', 'battles', 'Hitler', 'Roosevelt', 'Churchill'],
    lastModified: '2 days ago',
    wordCount: 456
  },
  {
    id: 4,
    title: 'Algebra: Quadratic Functions and Equations',
    content: `# Quadratic Functions and Equations

## Standard Form
**f(x) = ax² + bx + c** where a ≠ 0

- **a**: coefficient of x², determines opening direction
  - a > 0: parabola opens upward
  - a < 0: parabola opens downward
- **b**: coefficient of x, affects axis of symmetry
- **c**: constant term, y-intercept

## Vertex Form
**f(x) = a(x - h)² + k**
- **(h, k)**: vertex coordinates
- **h**: x-coordinate of vertex = -b/(2a)
- **k**: y-coordinate of vertex = f(h)

## Factored Form
**f(x) = a(x - r₁)(x - r₂)**
- **r₁, r₂**: x-intercepts (roots/zeros)

## Key Features

### Vertex
- Maximum point (if a < 0) or minimum point (if a > 0)
- x-coordinate: x = -b/(2a)
- y-coordinate: substitute x-value into original equation

### Axis of Symmetry
- Vertical line through vertex: x = -b/(2a)
- Parabola is symmetric about this line

### Intercepts
- **y-intercept**: Set x = 0, solve for y (gives point (0, c))
- **x-intercepts**: Set y = 0, solve for x

## Solving Quadratic Equations

### Method 1: Factoring
For ax² + bx + c = 0:
1. Factor if possible: (mx + p)(nx + q) = 0
2. Set each factor to zero
3. Solve for x

### Method 2: Quadratic Formula
**x = (-b ± √(b² - 4ac)) / (2a)**

Discriminant: Δ = b² - 4ac
- Δ > 0: Two real solutions
- Δ = 0: One real solution (repeated root)
- Δ < 0: No real solutions (complex solutions)

### Method 3: Completing the Square
1. Write in form x² + bx = -c
2. Add (b/2)² to both sides
3. Factor left side as perfect square
4. Take square root of both sides

## Applications
- Projectile motion: h(t) = -16t² + v₀t + h₀
- Area optimization problems
- Profit/cost analysis in business
- Physics: acceleration, displacement

## Practice Examples
1. Solve: x² - 5x + 6 = 0
2. Find vertex of: f(x) = 2x² - 8x + 3
3. Factor: x² - 7x + 12
4. Use quadratic formula: 2x² + 3x - 1 = 0`,
    subject: 'Math',
    tags: ['quadratic', 'parabola', 'vertex', 'factoring', 'formula'],
    lastModified: '3 days ago',
    wordCount: 387
  }
];

// Enhanced Quiz Questions by Subject
export const mockQuizzes = [
  {
    id: 1,
    title: 'Biology Fundamentals Quiz',
    subject: 'Biology',
    difficulty: 'Medium' as const,
    questionCount: 8,
    timeLimit: 15,
    description: 'Test your knowledge of basic biology concepts',
    lastTaken: '2 days ago',
    bestScore: 87,
    questions: [
      {
        id: 1,
        question: "What is the main function of mitochondria in a cell?",
        options: ["Protein synthesis", "Energy production", "DNA storage", "Waste removal"],
        correctAnswer: 1,
        explanation: "Mitochondria are called the powerhouse of the cell because they produce ATP through cellular respiration."
      },
      {
        id: 2,
        question: "Which process converts light energy into chemical energy in plants?",
        options: ["Cellular respiration", "Photosynthesis", "Fermentation", "Glycolysis"],
        correctAnswer: 1,
        explanation: "Photosynthesis is the process by which plants convert light energy into glucose using CO₂ and water."
      },
      {
        id: 3,
        question: "What are the four main types of biomolecules?",
        options: ["Carbohydrates, lipids, proteins, nucleic acids", "DNA, RNA, enzymes, sugars", "Atoms, molecules, compounds, elements", "Cells, tissues, organs, systems"],
        correctAnswer: 0,
        explanation: "The four major biomolecules are carbohydrates, lipids, proteins, and nucleic acids, each with specific functions."
      },
      {
        id: 4,
        question: "In which part of the cell does transcription occur?",
        options: ["Cytoplasm", "Ribosome", "Nucleus", "Mitochondria"],
        correctAnswer: 2,
        explanation: "Transcription (DNA → RNA) occurs in the nucleus where DNA is located."
      }
    ]
  },
  {
    id: 2,
    title: 'Chemistry Basics Assessment',
    subject: 'Chemistry',
    difficulty: 'Easy' as const,
    questionCount: 6,
    timeLimit: 12,
    description: 'Fundamental chemistry concepts and atomic structure',
    lastTaken: '5 days ago',
    bestScore: 92,
    questions: [
      {
        id: 5,
        question: "What is the atomic number of an element?",
        options: ["Number of neutrons", "Number of protons", "Number of electrons", "Atomic mass"],
        correctAnswer: 1,
        explanation: "The atomic number is the number of protons in an atom's nucleus, which defines the element."
      },
      {
        id: 6,
        question: "Which type of bond forms between a metal and a non-metal?",
        options: ["Covalent bond", "Metallic bond", "Ionic bond", "Hydrogen bond"],
        correctAnswer: 2,
        explanation: "Ionic bonds form when electrons are transferred from a metal to a non-metal, creating charged ions."
      },
      {
        id: 7,
        question: "What is Avogadro's number approximately?",
        options: ["6.022 × 10²³", "3.14 × 10⁸", "9.8 × 10¹⁰", "1.6 × 10⁻¹⁹"],
        correctAnswer: 0,
        explanation: "Avogadro's number (6.022 × 10²³) represents the number of particles in one mole of substance."
      }
    ]
  },
  {
    id: 3,
    title: 'Physics Laws and Motion',
    subject: 'Physics',
    difficulty: 'Hard' as const,
    questionCount: 7,
    timeLimit: 20,
    description: 'Newton\'s laws, thermodynamics, and motion principles',
    lastTaken: '1 week ago',
    bestScore: 78,
    questions: [
      {
        id: 8,
        question: "According to Newton's Second Law, if the mass of an object is doubled while the force remains constant, what happens to acceleration?",
        options: ["Doubles", "Halves", "Remains the same", "Quadruples"],
        correctAnswer: 1,
        explanation: "F = ma, so if mass doubles and force is constant, acceleration must halve to maintain the equation."
      },
      {
        id: 9,
        question: "What does the First Law of Thermodynamics state?",
        options: ["Energy cannot be created or destroyed", "Entropy always increases", "Heat flows from hot to cold", "Absolute zero is unreachable"],
        correctAnswer: 0,
        explanation: "The First Law states that energy cannot be created or destroyed, only converted from one form to another."
      },
      {
        id: 10,
        question: "A ball is thrown horizontally from a cliff. What is the acceleration in the horizontal direction?",
        options: ["9.8 m/s²", "0 m/s²", "Depends on initial velocity", "Depends on height"],
        correctAnswer: 1,
        explanation: "In projectile motion, horizontal acceleration is zero (ignoring air resistance). Only gravity acts vertically."
      }
    ]
  },
  {
    id: 4,
    title: 'Algebra and Functions',
    subject: 'Math',
    difficulty: 'Medium' as const,
    questionCount: 10,
    timeLimit: 18,
    description: 'Quadratic equations, functions, and algebraic manipulation',
    lastTaken: '3 days ago',
    bestScore: 85,
    questions: [
      {
        id: 11,
        question: "What is the discriminant of the quadratic equation 2x² + 5x - 3 = 0?",
        options: ["25", "49", "1", "7"],
        correctAnswer: 1,
        explanation: "Discriminant = b² - 4ac = 5² - 4(2)(-3) = 25 + 24 = 49"
      },
      {
        id: 12,
        question: "If f(x) = 3x² - 2x + 1, what is f(2)?",
        options: ["9", "11", "13", "15"],
        correctAnswer: 0,
        explanation: "f(2) = 3(2)² - 2(2) + 1 = 3(4) - 4 + 1 = 12 - 4 + 1 = 9"
      },
      {
        id: 13,
        question: "What is the vertex of the parabola y = x² - 4x + 3?",
        options: ["(2, -1)", "(2, 1)", "(-2, -1)", "(-2, 1)"],
        correctAnswer: 0,
        explanation: "Vertex x-coordinate: x = -b/(2a) = 4/2 = 2. y = 2² - 4(2) + 3 = -1. Vertex is (2, -1)."
      }
    ]
  },
  {
    id: 5,
    title: 'World War II Knowledge Test',
    subject: 'History',
    difficulty: 'Easy' as const,
    questionCount: 12,
    timeLimit: 15,
    description: 'Major events, dates, and figures from WWII',
    lastTaken: '1 week ago',
    bestScore: 95,
    questions: [
      {
        id: 14,
        question: "When did World War II officially begin?",
        options: ["September 1, 1939", "December 7, 1941", "June 6, 1944", "May 8, 1945"],
        correctAnswer: 0,
        explanation: "WWII began on September 1, 1939, when Germany invaded Poland."
      },
      {
        id: 15,
        question: "What was the code name for the Allied invasion of Normandy?",
        options: ["Operation Barbarossa", "Operation Overlord", "Operation Market Garden", "Operation Torch"],
        correctAnswer: 1,
        explanation: "Operation Overlord was the code name for D-Day, the Allied invasion of Normandy on June 6, 1944."
      },
      {
        id: 16,
        question: "Which battle is considered the turning point of the war in the Pacific?",
        options: ["Pearl Harbor", "Battle of Midway", "Battle of Guadalcanal", "Battle of Iwo Jima"],
        correctAnswer: 1,
        explanation: "The Battle of Midway (June 4-7, 1942) was the turning point in the Pacific, crippling the Japanese navy."
      },
      {
        id: 17,
        question: "What event brought the United States into World War II?",
        options: ["Germany invading Poland", "Battle of Britain", "Pearl Harbor attack", "Fall of France"],
        correctAnswer: 2,
        explanation: "The Japanese attack on Pearl Harbor on December 7, 1941, brought the US into WWII."
      }
    ]
  }
];

export const mockStudyCards = [
  {
    id: 1,
    front: "What is the function of mitochondria in a cell?",
    back: "Mitochondria are the powerhouse of the cell. They produce ATP (energy) through cellular respiration, converting glucose and oxygen into usable energy for cellular processes.",
    subject: "Biology",
    difficulty: "Medium" as const
  },
  {
    id: 2,
    front: "Explain the process of photosynthesis",
    back: "Photosynthesis is the process by which plants convert light energy into chemical energy. Using chlorophyll, plants absorb sunlight and combine CO₂ and water to produce glucose and oxygen. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
    subject: "Biology",
    difficulty: "Hard" as const
  },
  {
    id: 3,
    front: "What is the periodic table?",
    back: "The periodic table is a tabular arrangement of chemical elements organized by atomic number. Elements are grouped by similar properties in vertical columns called groups or families, and horizontal rows called periods.",
    subject: "Chemistry",
    difficulty: "Easy" as const
  },
  {
    id: 4,
    front: "State Newton's Three Laws of Motion",
    back: "1st Law (Inertia): Objects at rest stay at rest, objects in motion stay in motion unless acted upon by force. 2nd Law: F = ma (Force equals mass times acceleration). 3rd Law: For every action, there is an equal and opposite reaction.",
    subject: "Physics",
    difficulty: "Hard" as const
  },
  {
    id: 5,
    front: "What is the quadratic formula?",
    back: "The quadratic formula is used to solve equations of the form ax² + bx + c = 0. The formula is: x = (-b ± √(b² - 4ac)) / 2a. It gives the x-intercepts (roots) of a quadratic equation.",
    subject: "Math",
    difficulty: "Medium" as const
  }
];

// Utility functions for flashcard performance and sorting
export const getPerformanceColor = (level: PerformanceLevel): string => {
  switch (level) {
    case 'new': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    case 'learning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'familiar': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'mastered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const getAccuracyPercentage = (performance: CardPerformance): number => {
  if (performance.timesStudied === 0) return 0;
  return Math.round((performance.timesCorrect / performance.timesStudied) * 100);
};

export type SortOption = 'default' | 'accuracy-asc' | 'accuracy-desc' | 'level' | 'needs-review' | 'last-studied' | 'difficulty';

export const sortFlashcards = (cards: any[], sortBy: SortOption): any[] => {
  const sorted = [...cards];
  
  switch (sortBy) {
    case 'accuracy-asc':
      return sorted.sort((a, b) => getAccuracyPercentage(a.performance) - getAccuracyPercentage(b.performance));
    
    case 'accuracy-desc':
      return sorted.sort((a, b) => getAccuracyPercentage(b.performance) - getAccuracyPercentage(a.performance));
    
    case 'level':
      const levelOrder = { 'new': 0, 'learning': 1, 'familiar': 2, 'mastered': 3 };
      return sorted.sort((a, b) => levelOrder[a.performance.currentLevel] - levelOrder[b.performance.currentLevel]);
    
    case 'needs-review':
      return sorted.sort((a, b) => {
        if (a.performance.needsReview && !b.performance.needsReview) return -1;
        if (!a.performance.needsReview && b.performance.needsReview) return 1;
        return 0;
      });
    
    case 'last-studied':
      return sorted.sort((a, b) => {
        const aTime = a.performance.lastStudied?.getTime() || 0;
        const bTime = b.performance.lastStudied?.getTime() || 0;
        return bTime - aTime; // Most recent first
      });
    
    case 'difficulty':
      const difficultyOrder = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
      return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    
    default:
      return sorted;
  }
};

export const updateCardPerformance = (
  performance: CardPerformance, 
  result: StudyResult, 
  responseTime: number
): CardPerformance => {
  const newPerformance = { ...performance };
  
  newPerformance.timesStudied += 1;
  newPerformance.lastStudied = new Date();
  
  // Update accuracy stats
  if (result === 'correct' || result === 'easy') {
    newPerformance.timesCorrect += 1;
    newPerformance.consecutiveCorrect += 1;
  } else {
    newPerformance.timesIncorrect += 1;
    newPerformance.consecutiveCorrect = 0;
  }
  
  // Update average response time
  newPerformance.averageResponseTime = 
    (newPerformance.averageResponseTime * (newPerformance.timesStudied - 1) + responseTime) / newPerformance.timesStudied;
  
  // Update performance level
  const accuracy = newPerformance.timesCorrect / newPerformance.timesStudied;
  
  if (newPerformance.consecutiveCorrect >= 3 && accuracy >= 0.9) {
    newPerformance.currentLevel = 'mastered';
  } else if (accuracy >= 0.7 && newPerformance.timesStudied >= 3) {
    newPerformance.currentLevel = 'familiar';
  } else if (newPerformance.timesStudied >= 1) {
    newPerformance.currentLevel = 'learning';
  }
  
  // Determine if needs review
  newPerformance.needsReview = 
    accuracy < 0.6 || 
    newPerformance.consecutiveCorrect === 0 && newPerformance.timesIncorrect >= 2 ||
    (newPerformance.lastStudied && (Date.now() - newPerformance.lastStudied.getTime()) > 7 * 24 * 60 * 60 * 1000); // More than a week
  
  return newPerformance;
};