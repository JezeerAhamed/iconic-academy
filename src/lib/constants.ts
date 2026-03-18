// =====================================================
// ICONIC ACADEMY – Subject & Syllabus Constants
// =====================================================

import { Subject, SubjectId } from './types';

export const SUBJECTS: Subject[] = [
    {
        id: 'physics',
        name: 'Physics',
        description: 'Master mechanics, waves, electromagnetism, and modern physics through structured A/L content.',
        icon: '⚛️',
        color: '#3b82f6',
        colorLight: '#93c5fd',
        gradient: 'from-blue-500 to-blue-700',
        bgGradient: 'from-blue-950/50 to-blue-900/20',
        unitCount: 11,
        lessonCount: 88,
    },
    {
        id: 'chemistry',
        name: 'Chemistry',
        description: 'Explore atomic structure, organic chemistry, electrochemistry and industrial processes.',
        icon: '🧪',
        color: '#f97316',
        colorLight: '#fdba74',
        gradient: 'from-orange-500 to-orange-700',
        bgGradient: 'from-orange-950/50 to-orange-900/20',
        unitCount: 14,
        lessonCount: 112,
    },
    {
        id: 'biology',
        name: 'Biology',
        description: 'Understand life at cellular, organism, and ecosystem levels with detailed Sri Lankan A/L coverage.',
        icon: '🧬',
        color: '#22c55e',
        colorLight: '#86efac',
        gradient: 'from-green-500 to-green-700',
        bgGradient: 'from-green-950/50 to-green-900/20',
        unitCount: 10,
        lessonCount: 80,
    },
    {
        id: 'maths',
        name: 'Combined Maths',
        description: 'Conquer pure and applied mathematics — from calculus to mechanics, with exam-ready strategies.',
        icon: '📐',
        color: '#a855f7',
        colorLight: '#d8b4fe',
        gradient: 'from-purple-500 to-purple-700',
        bgGradient: 'from-purple-950/50 to-purple-900/20',
        unitCount: 16,
        lessonCount: 128,
    },
];

export const SUBJECT_MAP: Record<SubjectId, Subject> = Object.fromEntries(
    SUBJECTS.map(s => [s.id, s])
) as Record<SubjectId, Subject>;

// ── Full Sri Lankan A/L Syllabus ───────────────────

export const SYLLABUS = {
    physics: [
        { id: 'ph-01', title: 'Measurement', description: 'Units, Dimensions, Errors and Uncertainty' },
        { id: 'ph-02', title: 'Mechanics', description: 'Kinematics, Dynamics, Statics, Hydrostatics' },
        { id: 'ph-03', title: 'Oscillations and Waves', description: 'Sound, Light, and Optics' },
        { id: 'ph-04', title: 'Thermal Physics', description: 'Heat Transfer and Thermodynamics' },
        { id: 'ph-05', title: 'Gravitational Field', description: 'Gravity and Orbital Motion' },
        { id: 'ph-06', title: 'Electrostatic Field', description: "Coulomb's Law, Electric Fields and Potential" },
        { id: 'ph-07', title: 'Magnetic Field', description: 'Magnetic Forces, Induction and Flux' },
        { id: 'ph-08', title: 'Current Electricity', description: 'Circuits, Resistance and Power' },
        { id: 'ph-09', title: 'Electronics', description: 'Semiconductors and Logic Gates' },
        { id: 'ph-10', title: 'Mechanical Properties of Matter', description: 'Elasticity, Viscosity and Surface Tension' },
        { id: 'ph-11', title: 'Matter and Radiation', description: 'Quantum Physics, Radioactivity and X-rays' },
    ],
    chemistry: [
        { id: 'ch-01', title: 'Atomic Structure', description: 'Electron Configuration and Atomic Models' },
        { id: 'ch-02', title: 'Structure and Bonding', description: 'Ionic, Covalent and Metallic Bonding' },
        { id: 'ch-03', title: 'Chemical Calculations', description: 'Stoichiometry and Molar Calculations' },
        { id: 'ch-04', title: 'Gaseous State', description: 'Gas Laws and Kinetic Theory' },
        { id: 'ch-05', title: 'Energetics', description: 'Thermodynamics and Enthalpy' },
        { id: 'ch-06', title: 's, p, d Block Elements', description: 'Transition Metals and Periodic Trends' },
        { id: 'ch-07', title: 'Basic Organic Chemistry', description: 'Functional Groups and Reactions' },
        { id: 'ch-08', title: 'Hydrocarbons & Halobenzenes', description: 'Alkanes, Alkenes, Alkynes and Arenes' },
        { id: 'ch-09', title: 'Kinetics', description: 'Reaction Rates and Rate Laws' },
        { id: 'ch-10', title: 'Chemical Equilibrium', description: "Le Chatelier's Principle and Kc/Kp" },
        { id: 'ch-11', title: 'Electrochemistry', description: 'Electrolysis and Electrochemical Cells' },
        { id: 'ch-12', title: 'Oxygen & Nitrogen Organic Compounds', description: 'Alcohols, Aldehydes, Amines' },
        { id: 'ch-13', title: 'Environmental Chemistry', description: 'Pollution and Green Chemistry' },
        { id: 'ch-14', title: 'Industrial Chemistry', description: 'Haber, Contact and Solvay Processes' },
    ],
    biology: [
        { id: 'bi-01', title: 'Introduction to Biology', description: 'Nature and Scope of Biology' },
        { id: 'bi-02', title: 'Cellular Basis of Life', description: 'Cell Structure, Division and Transport' },
        { id: 'bi-03', title: 'Evolution & Diversity', description: 'Natural Selection and Classification' },
        { id: 'bi-04', title: 'Plant Physiology', description: 'Photosynthesis, Transport and Growth' },
        { id: 'bi-05', title: 'Human Physiology', description: 'Organ Systems and Homeostasis' },
        { id: 'bi-06', title: 'Genetics', description: 'Mendelian Genetics and Inheritance' },
        { id: 'bi-07', title: 'Molecular Biology', description: 'DNA, RNA and Protein Synthesis' },
        { id: 'bi-08', title: 'Environmental Biology', description: 'Ecosystems and Conservation' },
        { id: 'bi-09', title: 'Microbiology', description: 'Bacteria, Viruses and Fungi' },
        { id: 'bi-10', title: 'Applied Biology', description: 'Biotechnology and Agricultural Applications' },
    ],
    maths: [
        // Pure Maths
        { id: 'pm-01', title: 'Number Systems', description: 'Real, Complex and Rational Numbers' },
        { id: 'pm-02', title: 'Polynomials', description: 'Roots, Factors and Remainder Theorem' },
        { id: 'pm-03', title: 'Quadratics', description: 'Discriminant, Vertex and Transformations' },
        { id: 'pm-04', title: 'Logarithms', description: 'Laws, Natural Log and Exponentials' },
        { id: 'pm-05', title: 'Trigonometry', description: 'Identities, Equations and Graphs' },
        { id: 'pm-06', title: 'Limits & Differentiation', description: 'Derivatives, Rules and Applications' },
        { id: 'pm-07', title: 'Integration', description: 'Definite and Indefinite Integrals' },
        { id: 'pm-08', title: 'Coordinate Geometry', description: 'Lines, Circles and Conics' },
        // Applied Maths
        { id: 'am-01', title: 'Vectors', description: '2D and 3D Vector Operations' },
        { id: 'am-02', title: 'Statics', description: 'Forces, Moments and Equilibrium' },
        { id: 'am-03', title: 'Kinematics', description: 'Motion with Equations and Graphs' },
        { id: 'am-04', title: 'Projectiles', description: 'Parabolic Motion and Range Analysis' },
        { id: 'am-05', title: 'Relative Velocity', description: 'Relative Motion and Interception' },
        { id: 'am-06', title: 'Dynamics', description: "Newton's Laws and Friction" },
        { id: 'am-07', title: 'Work, Energy, Power', description: 'Conservation Laws and Efficiency' },
        { id: 'am-08', title: 'Probability & Statistics', description: 'Distributions, Mean and Variance' },
    ],
};

// ── XP & Level System ─────────────────────────────

export const LEVEL_THRESHOLDS = {
    Beginner: 0,
    Intermediate: 500,
    Advanced: 2000,
    Ranker: 5000,
};

export const XP_REWARDS = {
    lesson_complete: 50,
    practice_complete: 30,
    perfect_score: 100,
    daily_streak: 20,
    weekly_streak: 150,
    first_lesson: 75,
    unit_complete: 200,
    subject_complete: 1000,
};

// ── Subscription Plans ────────────────────────────

export const SUBSCRIPTION_PLANS = {
    free: {
        name: 'Free',
        price: 0,
        features: ['3 subjects', '5 lessons/month', 'Basic AI tutor (5 queries/day)', 'Practice questions'],
    },
    pro: {
        name: 'Pro',
        price: 1499,
        features: ['All 4 subjects', 'Unlimited lessons', 'AI tutor (50 queries/day)', 'Past papers', 'Progress analytics'],
    },
    elite: {
        name: 'Elite',
        price: 2999,
        features: ['Everything in Pro', 'Unlimited AI tutor', 'Voice AI tutor', 'Admin access', 'Priority support'],
    },
};

export const NAV_LINKS = [
    { label: 'Subjects', href: '/subjects' },
    { label: 'Past Papers', href: '/past-papers' },
    { label: 'AI Tutor', href: '/ai-tutor' },
    { label: 'Pricing', href: '/pricing' },
];
