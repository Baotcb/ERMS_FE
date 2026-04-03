'use strict';

import type { TrainingPlan } from '../types/training-plan-types';

// ─── Status colors ───
export const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-amber-100 text-amber-800 border-amber-200',
    Active: 'bg-blue-100 text-blue-800 border-blue-200',
    Completed: 'bg-purple-100 text-purple-800 border-purple-200',
    Closed: 'bg-slate-100 text-slate-800 border-slate-200',
    AddedToPlan: 'bg-blue-100 text-blue-800 border-blue-200',
    Published: 'bg-green-100 text-green-800 border-green-200',
    Archived: 'bg-slate-100 text-slate-700 border-slate-200',
};

// ─── Status labels ───
export const STATUS_LABELS: Record<string, string> = {
    Draft: 'Bản nháp',
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Yêu cầu gửi lại',
    Active: 'Đang triển khai',
    Completed: 'Đã hoàn thành',
    Closed: 'Đã đóng',
    AddedToPlan: 'Đã thêm vào KH',
    Published: 'Đã xuất bản',
    Archived: 'Đã lưu trữ',
};

// ─── Review note prefixes ───
export const RESUBMIT_REQUEST_PREFIX = '[RESUBMIT_REQUEST]';
export const FINAL_REJECT_PREFIX = '[FINAL_REJECT]';

// ─── Helpers ───
export function getStatusLabel(plan: TrainingPlan): string {
    if (plan.status !== 'Rejected') {
        return STATUS_LABELS[plan.status] || plan.status;
    }

    const note = (plan.reviewNote || '').trim();
    if (note.startsWith(FINAL_REJECT_PREFIX)) {
        return 'Từ chối';
    }

    if (note.startsWith(RESUBMIT_REQUEST_PREFIX)) {
        return 'Yêu cầu gửi lại';
    }

    return STATUS_LABELS.Rejected;
}

export function getDisplayReviewNote(rawNote?: string): string {
    if (!rawNote) return '';
    return rawNote
        .replace(RESUBMIT_REQUEST_PREFIX, '')
        .replace(FINAL_REJECT_PREFIX, '')
        .trim();
}

export function getReviewNoteHeading(rawNote?: string): string {
    if (!rawNote) return 'Ghi chú duyệt';
    if (rawNote.startsWith(RESUBMIT_REQUEST_PREFIX)) return 'Lý do yêu cầu gửi lại';
    if (rawNote.startsWith(FINAL_REJECT_PREFIX)) return 'Lý do từ chối';
    return 'Ghi chú duyệt';
}
