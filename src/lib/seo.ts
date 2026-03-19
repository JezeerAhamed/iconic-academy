import type { Metadata } from 'next';
import type { SubjectId } from './types';

export const SITE_URL = 'https://iconicacademy.lk';
export const SITE_NAME = 'Iconic Academy';
export const DEFAULT_OG_IMAGE = '/og-default.jpg';
export const DEFAULT_DESCRIPTION =
  'Iconic Academy helps Sri Lankan A/L students study Physics, Chemistry, Biology, and Combined Maths with structured lessons, AI tutoring, and past-paper practice.';

export const DEFAULT_KEYWORDS = [
  'Sri Lanka A/L',
  'A/L past papers',
  'A/L physics',
  'A/L chemistry',
  'A/L biology',
  'Combined Maths Sri Lanka',
  'AI tutor Sri Lanka',
  'A/L online learning',
  'Sri Lankan students',
  'Iconic Academy',
];

export const SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/results?search_query=JR+Highlights',
  instagram: 'https://www.instagram.com/jezeerjrahamed/',
  facebook: 'https://www.facebook.com/search/top/?q=Iconic%20Academy',
} as const;

export const SUBJECT_SEO: Record<
  SubjectId,
  {
    name: string;
    title: string;
    description: string;
    ogImage: string;
    keywords: string[];
  }
> = {
  physics: {
    name: 'Physics',
    title: 'A/L Physics — Full Syllabus — Iconic Academy',
    description:
      'Study the full Sri Lankan A/L Physics syllabus with structured units, guided lessons, and AI-supported exam preparation.',
    ogImage: '/og/physics.jpg',
    keywords: ['A/L Physics', 'Sri Lanka physics tuition', 'Physics past papers', 'Physics AI tutor'],
  },
  chemistry: {
    name: 'Chemistry',
    title: 'A/L Chemistry — Full Syllabus — Iconic Academy',
    description:
      'Master the full Sri Lankan A/L Chemistry syllabus with topic-by-topic lessons, exam-focused guidance, and AI support.',
    ogImage: '/og/chemistry.jpg',
    keywords: ['A/L Chemistry', 'Sri Lanka chemistry tuition', 'Chemistry past papers', 'Chemistry AI tutor'],
  },
  biology: {
    name: 'Biology',
    title: 'A/L Biology — Full Syllabus — Iconic Academy',
    description:
      'Cover the complete Sri Lankan A/L Biology syllabus with structured lessons, revision support, and AI-guided explanations.',
    ogImage: '/og/biology.jpg',
    keywords: ['A/L Biology', 'Sri Lanka biology tuition', 'Biology past papers', 'Biology AI tutor'],
  },
  maths: {
    name: 'Combined Maths',
    title: 'A/L Combined Maths — Full Syllabus — Iconic Academy',
    description:
      'Study the full Sri Lankan A/L Combined Maths syllabus with structured practice, concept breakdowns, and AI-guided help.',
    ogImage: '/og/maths.jpg',
    keywords: ['A/L Combined Maths', 'A/L Maths Sri Lanka', 'Combined Maths past papers', 'Maths AI tutor'],
  },
};

export const PRICING_FAQ_ENTRIES = [
  {
    question: 'Can I pay via Bank Transfer instead of a Credit Card?',
    answer:
      'Yes. Card payments run through Stripe at checkout, and if you prefer a bank transfer you can contact Iconic Academy on WhatsApp to arrange a manual activation.',
  },
  {
    question: 'Will the AI Tutor give me direct answers to exam questions?',
    answer:
      'The AI Tutor is designed to guide understanding first. It explains the reasoning, helps students correct mistakes, and supports exam thinking instead of handing out blind final answers.',
  },
  {
    question: 'Can I study offline or on mobile?',
    answer:
      'Yes. The platform is built mobile-first and works well on phones, and students can study across devices. Interactive features like AI chat still require an internet connection.',
  },
  {
    question: 'What language is the content in?',
    answer:
      'Core lessons are in clear English, and the AI Tutor can respond in Tamil when students write in Tamil. The platform is designed for Sri Lankan A/L learners in both languages.',
  },
  {
    question: 'How is this different from YouTube tutorials?',
    answer:
      'YouTube helps students watch lessons. Iconic Academy helps students complete the syllabus with structure, guided practice, progress tracking, and an AI Tutor built for A/L study flow.',
  },
  {
    question: 'What happens if I miss a live doubt session? (Elite plan)',
    answer:
      'Elite students can still continue using the rest of the platform tools, follow-up support, and session materials. Missing a live session does not interrupt access to the plan.',
  },
  {
    question: 'Can I switch between plans anytime?',
    answer:
      'Yes. Students can start free, upgrade when they need more support, and move between paid plans as their study needs change.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'Yes. Paid plans are covered by a 7-day refund window. If the platform is not the right fit, students can contact support within 7 days for review.',
  },
] as const;

export const PRICING_OFFERS = [
  {
    name: 'Free',
    price: 0,
    description: 'Try the platform with one subject, the first two units, limited AI tutoring, and limited MCQ practice.',
  },
  {
    name: 'Basic',
    price: 990,
    description: 'Unlock all four subjects, full syllabus access, unlimited AI tutor support, and unlimited MCQ past-paper practice.',
  },
  {
    name: 'Premium',
    price: 1990,
    description: 'Everything in Basic plus video lessons, AI essay grading, and a personalized study plan.',
  },
  {
    name: 'Elite',
    price: 3490,
    description: 'Everything in Premium plus weekly live sessions, voice AI support, and a parent dashboard.',
  },
] as const;

type GenerateMetaInput = {
  title: string;
  description?: string;
  pathname?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
};

function normalizePathname(pathname = '/') {
  const [pathOnly] = pathname.split('?');
  const trimmed = pathOnly.trim();

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`;
}

export function absoluteUrl(pathname = '/') {
  const normalizedPathname = normalizePathname(pathname);
  return normalizedPathname === '/' ? SITE_URL : `${SITE_URL}${normalizedPathname}`;
}

function buildOgImages(image: string, alt: string) {
  const imageUrl = image.startsWith('http') ? image : absoluteUrl(image);

  return [
    {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Iconic Academy — Sri Lanka's AI-Powered A/L Learning Platform",
    template: '%s | Iconic Academy',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Iconic Academy — Sri Lanka's AI-Powered A/L Learning Platform",
    description: DEFAULT_DESCRIPTION,
    images: buildOgImages(DEFAULT_OG_IMAGE, SITE_NAME),
  },
  twitter: {
    card: 'summary_large_image',
    title: "Iconic Academy — Sri Lanka's AI-Powered A/L Learning Platform",
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export function generateMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname = '/',
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  type = 'website',
}: GenerateMetaInput): Metadata {
  const canonical = absoluteUrl(pathname);
  const mergedKeywords = Array.from(new Set([...DEFAULT_KEYWORDS, ...keywords]));

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type,
      locale: 'en_LK',
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: buildOgImages(image, title),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.startsWith('http') ? image : absoluteUrl(image)],
    },
  };
}

export function getHomepageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl('/logo.jpg'),
        sameAs: [SOCIAL_LINKS.youtube, SOCIAL_LINKS.instagram, SOCIAL_LINKS.facebook],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            telephone: '+94771041815',
            email: 'jezeerahamed254@gmail.com',
            areaServed: 'LK',
            availableLanguage: ['en', 'ta'],
          },
        ],
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/subjects?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function getPricingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: PRICING_FAQ_ENTRIES.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      ...PRICING_OFFERS.map((offer) => ({
        '@type': 'Offer',
        name: `${SITE_NAME} ${offer.name} Plan`,
        description: offer.description,
        price: offer.price,
        priceCurrency: 'LKR',
        availability: 'https://schema.org/InStock',
        category: 'EducationSubscription',
        url: absoluteUrl('/pricing'),
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
      })),
    ],
  };
}

export function getSubjectJsonLd(subjectId: SubjectId) {
  const subject = SUBJECT_SEO[subjectId];

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `A/L ${subject.name}`,
    description: subject.description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    educationalLevel: 'Advanced Level',
    courseLanguage: ['en', 'ta'],
    url: absoluteUrl(`/subjects/${subjectId}`),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      location: {
        '@type': 'VirtualLocation',
        url: absoluteUrl(`/subjects/${subjectId}`),
      },
    },
  };
}

export function getPastPapersJsonLd() {
  const subjects: SubjectId[] = ['physics', 'chemistry', 'biology', 'maths'];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: subjects.map((subjectId, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `A/L ${SUBJECT_SEO[subjectId].name} past papers`,
      url: absoluteUrl(`/subjects/${subjectId}`),
    })),
  };
}
