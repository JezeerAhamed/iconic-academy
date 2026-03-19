import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/subjects', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/ai-tutor', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/past-papers', changeFrequency: 'weekly', priority: 0.8 },
  ];

  const subjectRoutes = ['physics', 'chemistry', 'biology', 'maths'].map((slug) => ({
    url: absoluteUrl(`/subjects/${slug}`),
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...subjectRoutes,
  ];
}
