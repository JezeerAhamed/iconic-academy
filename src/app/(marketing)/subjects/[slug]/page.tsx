import type { Metadata } from 'next';
import type { SubjectId } from '@/lib/types';
import JsonLd from '@/components/seo/JsonLd';
import { SUBJECT_SEO, generateMeta, getSubjectJsonLd } from '@/lib/seo';
import SubjectClientPage from './SubjectClientPage';

const VALID_SLUGS = ['physics', 'chemistry', 'biology', 'maths'] as const;

export function generateStaticParams() {
  return [
    { slug: 'physics' },
    { slug: 'chemistry' },
    { slug: 'biology' },
    { slug: 'maths' },
  ];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const subject = SUBJECT_SEO[params.slug as SubjectId];

  if (!subject) {
    return generateMeta({
      title: 'Subject not found — Iconic Academy',
      description: 'Browse Sri Lankan A/L subjects with AI-guided lessons and past-paper practice.',
      pathname: `/subjects/${params.slug}`,
    });
  }

  return generateMeta({
    title: subject.title,
    description: subject.description,
    pathname: `/subjects/${params.slug}`,
    keywords: subject.keywords,
    image: subject.ogImage,
  });
}

export default function SubjectPage({ params }: { params: { slug: string } }) {
  const isValidSubject = params.slug in SUBJECT_SEO;

  return (
    <>
      {isValidSubject ? (
        <JsonLd id={`subject-${params.slug}-jsonld`} schema={getSubjectJsonLd(params.slug as SubjectId)} />
      ) : null}
      <SubjectClientPage
        slug={params.slug}
        validSlugs={[...VALID_SLUGS]}
      />
    </>
  );
}
