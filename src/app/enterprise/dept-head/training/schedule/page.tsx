import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-fetch';

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession();
    if (!session.user) {
        redirect('/login');
    }

    const resolvedParams = await searchParams;
    const courseId = typeof resolvedParams.courseId === 'string' ? resolvedParams.courseId : undefined;

    if (courseId) {
        redirect(`/enterprise/dept-head/training/assign?courseId=${courseId}`);
    }

    redirect('/enterprise/dept-head/training/assign');
}
