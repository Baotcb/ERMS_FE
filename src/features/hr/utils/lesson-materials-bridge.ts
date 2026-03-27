/**
 * ⚠️ NỢ KỸ THUẬT (TECH DEBT): Lesson Materials Local Storage Bridge
 *
 * Vấn đề: Backend chưa có entity LessonMaterial và endpoint upload tài liệu.
 * Workaround: Trainer upload file lên Cloudinary → lưu metadata vào localStorage
 *             → Learning page đọc localStorage để hiển thị cho học viên.
 *
 * TODO (Backend): Cần tạo entity LessonMaterial, migration, API endpoint POST/GET materials.
 *                 Sau khi có API, xóa toàn bộ file này và cập nhật cả 2 phía.
 *
 * Key format: `erms_lesson_materials_${courseId}`
 * Value: Record<lessonId, Material[]>
 */

import type { Material } from '@/features/hr/types/course-content-types';

const STORAGE_PREFIX = 'erms_lesson_materials_';

function getStorageKey(courseId: string): string {
    return `${STORAGE_PREFIX}${courseId}`;
}

/** Trainer side: save uploaded material */
export function saveLessonMaterial(courseId: string, lessonId: string, material: Material): void {
    if (typeof window === 'undefined') return;
    try {
        const key = getStorageKey(courseId);
        const raw = localStorage.getItem(key);
        const data: Record<string, Material[]> = raw ? JSON.parse(raw) : {};
        const existing = data[lessonId] || [];
        // Avoid duplicates by id
        if (!existing.some(m => m.id === material.id)) {
            existing.push(material);
        }
        data[lessonId] = existing;
        localStorage.setItem(key, JSON.stringify(data));
    } catch {
        // Ignore storage errors
    }
}

/** Learning side: get all materials for a course, keyed by lessonId */
export function getLessonMaterials(courseId: string): Record<string, Material[]> {
    if (typeof window === 'undefined') return {};
    try {
        const key = getStorageKey(courseId);
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}
