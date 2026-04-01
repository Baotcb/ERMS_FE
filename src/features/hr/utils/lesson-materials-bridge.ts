/**
 * ⚠️ TECH DEBT CŨ ĐÃ ĐƯỢC GIẢI QUYẾT
 *
 * File này từng làm cầu nối `localStorage` do Backend chưa thể cập nhật `DocumentUrl` của Lesson.
 * Hiện tại tầng Backend đã hỗ trợ API và mapper trả về field `DocumentUrl` thành `material` object.
 * Nên toàn bộ logic file này được đánh dấu là deprecated (đã lược bỏ) để tuân thủ kiến trúc Clean Architecture gốc.
 *
 * Mặc định không còn dùng trong `curriculum-manager.tsx` và `use-course-learning.ts`.
 */

export function saveLessonMaterial(): void {
    console.warn('saveLessonMaterial is deprecated. Backend already saves materials.');
}

export function getLessonMaterials(): Record<string, unknown[]> {
    console.warn('getLessonMaterials is deprecated. Backend returns materials via curriculum API.');
    return {};
}
