import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from './client';

export type Lesson = {
  id: string;
  title: string;
  teacherId: string;
  studentId: string;
  start: string;
  end: string;
  roomId?: string;
};

export type LessonsQuery = { start: string; end: string; teacherId?: string; studentId?: string };

export async function fetchLessons(params: LessonsQuery): Promise<Lesson[]> {
  const search = new URLSearchParams(params).toString();
  return request<Lesson[]>(`/lessons?${search}`);
}

export function useLessons(params: LessonsQuery) {
  return useQuery({
    queryKey: ['lessons', params],
    queryFn: () => fetchLessons(params),
    enabled: Boolean(params.start && params.end)
  });
}

export function useCreateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Lesson, 'id'>) =>
      request<Lesson>('/lessons', { method: 'POST', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons'] })
  });
}

