import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Handle escaped newlines and surrounding quotes from .env
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
  : '';

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: privateKey,
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const syllabusData = {
  physics: {
    nameEn: 'Physics',
    nameTa: 'பௌதிகவியல்',
    icon: 'Atom',
    colorHex: '#3b82f6',
    units: [
      { id: 'unit-1', titleEn: 'Measurement', titleTa: 'அளவீடு', descEn: 'SI units, dimensions, errors, significant figures' },
      { id: 'unit-2', titleEn: 'Mechanics', titleTa: 'பொறிமுறை', descEn: "kinematics, Newton's laws, momentum, projectile motion, circular motion, work/energy/power" },
      { id: 'unit-3', titleEn: 'Oscillations and Waves', titleTa: 'அலைவுகளும் அலைகளும்', descEn: 'SHM, wave properties, superposition, standing waves, Doppler effect' },
      { id: 'unit-4', titleEn: 'Thermal Physics', titleTa: 'வெப்பப் பௌதிகவியல்', descEn: 'temperature, heat capacity, ideal gases, thermodynamic laws, heat transfer' },
      { id: 'unit-5', titleEn: 'Gravitational Field', titleTa: 'ஈர்ப்புப் புலம்', descEn: "Newton's law, field strength, potential, orbital motion, satellites" },
      { id: 'unit-6', titleEn: 'Electrostatic Field', titleTa: 'நிலைமின் புலம்', descEn: "Coulomb's law, electric field, potential, capacitance, dielectrics" },
      { id: 'unit-7', titleEn: 'Magnetic Field', titleTa: 'காந்தப் புலம்', descEn: "magnetic force, flux density, electromagnetic induction, Faraday's law" },
      { id: 'unit-8', titleEn: 'Current Electricity', titleTa: 'ஓட்ட மின்னியல்', descEn: "Ohm's law, resistance, circuits, Kirchhoff's laws, internal resistance" },
      { id: 'unit-9', titleEn: 'Electronics', titleTa: 'இலத்திரனியல்', descEn: 'semiconductors, diodes, transistors, logic gates, op-amps' },
      { id: 'unit-10', titleEn: 'Mechanical Properties of Matter', titleTa: 'சடப்பொருளின் பொறிமுறை இயல்புகள்', descEn: "stress, strain, Young's modulus, viscosity, surface tension" },
      { id: 'unit-11', titleEn: 'Matter and Radiation', titleTa: 'சடப்பொருளும் கதிர்வீசலும்', descEn: 'atomic structure, photoelectric effect, radioactivity, nuclear reactions' }
    ]
  },
  chemistry: {
    nameEn: 'Chemistry',
    nameTa: 'இரசாயனவியல்',
    icon: 'FlaskConical',
    colorHex: '#f97316',
    units: [
      { id: 'unit-1', titleEn: 'Atomic Structure', titleTa: 'அணு அமைப்பு', descEn: 'atomic models, orbitals, electron configuration, periodic trends' },
      { id: 'unit-2', titleEn: 'Structure and Bonding', titleTa: 'அமைப்பும் பிணைப்பும்', descEn: 'ionic, covalent, metallic bonds, intermolecular forces, VSEPR' },
      { id: 'unit-3', titleEn: 'Chemical Calculations', titleTa: 'இரசாயனக் கணிப்பீடுகள்', descEn: 'mole concept, stoichiometry, empirical/molecular formula, yield' },
      { id: 'unit-4', titleEn: 'Gaseous State', titleTa: 'வாயு நிலை', descEn: 'ideal gas law, kinetic theory, real gases, partial pressures' },
      { id: 'unit-5', titleEn: 'Energetics', titleTa: 'சக்தியியல்', descEn: "enthalpy, Hess's law, bond energies, entropy, Gibbs free energy" },
      { id: 'unit-6', titleEn: 'Chemical Equilibrium', titleTa: 'இரசாயனச் சமநிலை', descEn: "Le Chatelier's principle, Kc, Kp, Ksp, acid-base equilibria" },
      { id: 'unit-7', titleEn: 'Electrochemistry', titleTa: 'மின் இரசாயனவியல்', descEn: 'redox, electrode potentials, electrolysis, electrochemical cells' },
      { id: 'unit-8', titleEn: 'Chemical Kinetics', titleTa: 'இரசாயன இயக்கவியல்', descEn: 'reaction rates, rate law, activation energy, catalysis' },
      { id: 'unit-9', titleEn: 'Organic Chemistry Introduction', titleTa: 'சேதன இரசாயனவியல் அறிமுகம்', descEn: 'nomenclature, isomerism, functional groups, reaction types' },
      { id: 'unit-10', titleEn: 'Hydrocarbons', titleTa: 'ஐதரோகாபன்கள்', descEn: 'alkanes, alkenes, alkynes, arenes, reactions and mechanisms' },
      { id: 'unit-11', titleEn: 'Halogen Compounds', titleTa: 'அலசன் சேர்வைகள்', descEn: 'substitution, elimination, nucleophilic reactions' },
      { id: 'unit-12', titleEn: 'Oxygen Compounds', titleTa: 'ஒட்சிசன் சேர்வைகள்', descEn: 'alcohols, ethers, aldehydes, ketones, carboxylic acids, esters' },
      { id: 'unit-13', titleEn: 'Nitrogen Compounds', titleTa: 'நைதரசன் சேர்வைகள்', descEn: 'amines, amides, amino acids, proteins, polymers' },
      { id: 'unit-14', titleEn: 'Industrial Chemistry', titleTa: 'கைத்தொழில் இரசாயனவியல்', descEn: 'Haber process, Contact process, extraction of metals' }
    ]
  },
  biology: {
    nameEn: 'Biology',
    nameTa: 'உயிரியல்',
    icon: 'Leaf',
    colorHex: '#22c55e',
    units: [
      { id: 'unit-1', titleEn: 'Introduction to Biology', titleTa: 'உயிரியல் அறிமுகம்', descEn: 'cell theory, microscopy, scientific method, biochemistry' },
      { id: 'unit-2', titleEn: 'Cellular Basis of Life', titleTa: 'உயிரின் கலப்பரப்பு', descEn: 'cell structure, membrane transport, cell division, organelles' },
      { id: 'unit-3', titleEn: 'Evolution and Diversity', titleTa: 'பரிணாமமும் பல்லினத்தன்மையும்', descEn: 'natural selection, classification, kingdoms, phylogeny' },
      { id: 'unit-4', titleEn: 'Plant Physiology', titleTa: 'தாவர உடலியல்', descEn: 'photosynthesis, respiration, transpiration, growth, hormones' },
      { id: 'unit-5', titleEn: 'Animal Physiology', titleTa: 'விலங்கு உடலியல்', descEn: 'digestion, circulation, respiration, excretion, homeostasis' },
      { id: 'unit-6', titleEn: 'Genetics', titleTa: 'பிறப்புரிமையியல்', descEn: 'Mendelian genetics, DNA structure, replication, transcription, translation' },
      { id: 'unit-7', titleEn: 'Ecology', titleTa: 'சூழலியல்', descEn: 'ecosystems, energy flow, nutrient cycles, population dynamics, conservation' },
      { id: 'unit-8', titleEn: 'Microorganisms', titleTa: 'நுண்ணங்கிகள்', descEn: 'bacteria, viruses, fungi, disease, immunity, biotechnology' },
      { id: 'unit-9', titleEn: 'Human Reproduction', titleTa: 'மனித இனப்பெருக்கம்', descEn: 'reproductive systems, gametogenesis, fertilization, development' },
      { id: 'unit-10', titleEn: 'Applied Biology', titleTa: 'பிரயோக உயிரியல்', descEn: 'genetic engineering, cloning, bioremediation, medical applications' }
    ]
  },
  maths: {
    nameEn: 'Combined Maths',
    nameTa: 'இணைந்த கணிதம்',
    icon: 'Calculator',
    colorHex: '#ef4444',
    units: [
      { id: 'unit-1', titleEn: 'Number Systems', titleTa: 'எண் முறைமைகள்', descEn: 'real numbers, surds, indices, logarithms, complex numbers' },
      { id: 'unit-2', titleEn: 'Polynomials', titleTa: 'பல்லுறுப்பிகள்', descEn: 'factor theorem, remainder theorem, partial fractions' },
      { id: 'unit-3', titleEn: 'Quadratics', titleTa: 'இருபடிச் சமன்பாடுகள்', descEn: 'discriminant, completing the square, inequalities' },
      { id: 'unit-4', titleEn: 'Logarithms and Exponentials', titleTa: 'மடக்கைகளும் சுட்டிகளும்', descEn: 'laws, equations, natural log, exponential growth' },
      { id: 'unit-5', titleEn: 'Trigonometry', titleTa: 'திரிகோணகணிதம்', descEn: 'ratios, identities, equations, inverse trig, addition formulae' },
      { id: 'unit-6', titleEn: 'Coordinate Geometry', titleTa: 'ஆள்கூற்று கேத்திரகணிதம்', descEn: 'straight lines, circles, parabolas, ellipses' },
      { id: 'unit-7', titleEn: 'Calculus: Differentiation', titleTa: 'நுண்கணிதம்: வகையிடல்', descEn: 'first principles, rules, applications, maxima/minima' },
      { id: 'unit-8', titleEn: 'Calculus: Integration', titleTa: 'நுண்கணிதம்: தொகையிடல்', descEn: 'definite/indefinite, techniques, areas, volumes' },
      { id: 'unit-9', titleEn: 'Sequences and Series', titleTa: 'தொடரிகளும் தொடர்களும்', descEn: 'AP, GP, binomial theorem, sigma notation' },
      { id: 'unit-10', titleEn: 'Vectors', titleTa: 'காவிக்கணிதம்', descEn: '2D and 3D, dot product, cross product, lines and planes' },
      { id: 'unit-11', titleEn: 'Matrices', titleTa: 'தாயங்கள்', descEn: 'operations, determinants, inverse, simultaneous equations' },
      { id: 'unit-12', titleEn: 'Mechanics: Statics', titleTa: 'பொறிமுறை: நிலையியல்', descEn: 'forces, moments, equilibrium, friction, centre of gravity' },
      { id: 'unit-13', titleEn: 'Mechanics: Kinematics', titleTa: 'பொறிமுறை: இயக்கவியல்', descEn: 'displacement-time, velocity-time, SUVAT, projectiles' },
      { id: 'unit-14', titleEn: 'Mechanics: Dynamics', titleTa: 'பொறிமுறை: விசையியக்கவியல்', descEn: "Newton's laws, connected particles, pulleys, momentum" },
      { id: 'unit-15', titleEn: 'Probability', titleTa: 'நிகழ்தகவு', descEn: 'sample space, conditional probability, distributions, Bayes theorem' },
      { id: 'unit-16', titleEn: 'Statistics', titleTa: 'புள்ளியியல்', descEn: 'data representation, measures, regression, hypothesis testing' }
    ]
  }
};

const lessonTemplates = [
  {
    titleEn: 'Core Concepts & Theories',
    titleTa: 'அடிப்படை எண்ணக்கருக்களும் தேற்றங்களும்',
    contentEn: `## Introduction to the Unit
In this lesson, we will explore the fundamental principles. Understanding these core concepts is essential for A/L mastery. 

### Key Formulas:
- $\\Delta = b^2 - 4ac$ (Discriminant)
- $F = ma$ (Newton's Second Law)

### Theory Breakdown
1. **Core Principle 1**: Always define the system first.
2. **Core Principle 2**: Use standard SI units.

**Worked Example**:
Determine the discriminant of $x^2 + 4x + 4 = 0$.
**Solution**: $a=1, b=4, c=4$. $\\Delta = 16 - 16 = 0$.

[EXAM TIP] Always explicitly state your final units to avoid losing marks in the final exam!`,
    contentTa: 'இந்த பாடத்தில், நாங்கள் அடிப்படை கொள்கைகளை ஆராய்வோம்.',
    durationMinutes: 15,
    xpReward: 50,
  },
  {
    titleEn: 'Advanced Applications',
    titleTa: 'உயர் பிரயோகங்கள்',
    contentEn: `## Extending the Principles
Once the core principles are known, applying them to complex scenarios is key for the A/L structuring.

### Important Scenarios
- When two bodies are connected by a light inextensible string, the tension $T$ is uniform throughout.

**Worked Example**:
Two bodies of masses $m_1$ and $m_2$ are connected. Determine the acceleration.
**Solution**: Use $F_{net} = (m_1 + m_2)a$.

[COMMON MISTAKE] Do not mix up weight ($mg$) and mass ($m$) when calculating dynamics!`,
    contentTa: 'அடிப்படை கொள்கைகளை பிரயோகிப்பது மிகவும் முக்கியமாகும்.',
    durationMinutes: 15,
    xpReward: 50,
  },
  {
    titleEn: 'Past Paper Analysis & MCQs',
    titleTa: 'கடந்தகால வினாத்தாள் பகுப்பாய்வு',
    contentEn: `## Mastering Exam Technique
To achieve an Island Rank, mastering past papers is non-negotiable.

### Common MCQ Traps
1. Neglecting air resistance when explicitly asked not to.
2. Forgetting to convert units to SI.

**Practice MCQ 1:**
What is the SI unit of momentum?
A) kgm/s
B) Ns
C) Both A and B
**Answer:** C. They are equivalent.

[EXAM TIP] Always scan all 5 options before marking your answer on the OMR sheet!`,
    contentTa: 'கடந்தகால வினாத்தாள்களை நன்கு பயிலுதல்.',
    durationMinutes: 15,
    xpReward: 50,
  }
];

async function seedDatabase() {
  try {
    console.log("Starting ICONIC ACADEMY Database Seed using Firebase Admin SDK...");
    let writeCount = 0;

    // Process each subject
    for (const [subjectId, subjectData] of Object.entries(syllabusData)) {
      console.log(`✅ Seeding Subject: ${subjectData.nameEn} (${subjectId})`);

      const subjectRef = db.collection('subjects').doc(subjectId);
      await subjectRef.set({
        slug: subjectId,
        nameEn: subjectData.nameEn,
        nameTa: subjectData.nameTa,
        icon: subjectData.icon,
        colorHex: subjectData.colorHex,
        totalUnits: subjectData.units.length,
        totalLessons: 3,
      });
      writeCount++;

      // Process units
      const batch = db.batch();
      for (let i = 0; i < subjectData.units.length; i++) {
        const unit = subjectData.units[i];
        const unitRef = db.collection('subjects').doc(subjectId).collection('units').doc(unit.id);

        batch.set(unitRef, {
          orderIndex: i + 1,
          titleEn: unit.titleEn,
          titleTa: unit.titleTa,
          descriptionEn: unit.descEn,
          isPublished: true,
        });
        writeCount++;

        // Seed 3 lessons ONLY for the FIRST unit (unit-1)
        if (i === 0) {
          for (let j = 0; j < lessonTemplates.length; j++) {
            const lesson = lessonTemplates[j];
            const lessonId = `lesson-${j + 1}`;
            const lessonRef = db.collection('subjects').doc(subjectId)
              .collection('units').doc(unit.id)
              .collection('lessons').doc(lessonId);

            batch.set(lessonRef, {
              orderIndex: j + 1,
              titleEn: lesson.titleEn,
              titleTa: lesson.titleTa,
              contentEn: lesson.contentEn,
              contentTa: lesson.contentTa,
              durationMinutes: lesson.durationMinutes,
              xpReward: lesson.xpReward,
              isPublished: true,
              createdAt: new Date()
            });
            writeCount++;
          }
        }
      }

      await batch.commit();
      console.log(`   Committed units and lessons for ${subjectData.nameEn}`);
    }

    console.log("\n🚀 SEED COMPLETE!");
    console.log(`Total documents written to Firestore: ${writeCount}`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Seed Script Error:", error);
    process.exit(1);
  }
}

seedDatabase();
