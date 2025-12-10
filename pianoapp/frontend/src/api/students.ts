import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from './client';

export type Student = {
  id: string;
  name: string;
  phone?: string;
  guardianName?: string;
};

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => request<Student[]>('/students')
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Student, 'id'>) =>
      request<Student>('/students', { method: 'POST', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] })
  });
}

