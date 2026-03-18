import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import LessonClient from './LessonClient';

interface PageProps {
    params: {
        slug: string;
        unit: string;
        lesson: string;
    };
}

export default async function LessonPage({ params }: PageProps) {
    const { slug, unit, lesson } = params;

    try {
        // Fetch Subject
        const subjectDoc = await adminDb.collection('subjects').doc(slug).get();
        if (!subjectDoc.exists) return notFound();
        const subjectData = subjectDoc.data()!;

        // Fetch Unit
        const unitDoc = await adminDb.collection('subjects').doc(slug).collection('units').doc(unit).get();
        if (!unitDoc.exists) return notFound();
        const unitData = unitDoc.data()!;

        // Fetch Target Lesson
        const lessonDoc = await adminDb.collection('subjects').doc(slug).collection('units').doc(unit).collection('lessons').doc(lesson).get();
        if (!lessonDoc.exists) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <h2 className="text-2xl font-bold text-white mb-4">Lesson coming soon</h2>
                    <a href={`/dashboard/subjects/${slug}`} className="text-indigo-400 hover:text-indigo-300">
                        &larr; Head back to the {subjectData.nameEn || subjectData.name} syllabus
                    </a>
                </div>
            );
        }
        const lessonData = { id: lessonDoc.id, ...lessonDoc.data() };

        // Fetch Total Lessons for this unit to determine next/prev bounds and counts
        const lessonsSnapshot = await adminDb
            .collection('subjects')
            .doc(slug)
            .collection('units')
            .doc(unit)
            .collection('lessons')
            .orderBy('orderIndex', 'asc')
            .get();

        const allLessons = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const currentIndex = allLessons.findIndex(l => l.id === lessonData.id);

        const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
        const totalLessons = allLessons.length;

        const payload = {
            subject: {
                id: subjectDoc.id,
                nameEn: subjectData.nameEn,
                nameTa: subjectData.nameTa,
            },
            unit: {
                id: unitDoc.id,
                titleEn: unitData.titleEn,
                titleTa: unitData.titleTa,
                orderIndex: unitData.orderIndex,
            },
            lesson: lessonData as any,
            prevLesson: prevLesson ? { id: prevLesson.id, titleEn: (prevLesson as any).titleEn, titleTa: (prevLesson as any).titleTa } : null,
            nextLesson: nextLesson ? { id: nextLesson.id, titleEn: (nextLesson as any).titleEn, titleTa: (nextLesson as any).titleTa } : null,
            totalLessons,
            currentLessonNumber: currentIndex + 1,
        };

        return <LessonClient data={payload} />;

    } catch (error) {
        console.error("Error fetching lesson:", error);
        return notFound();
    }
}
