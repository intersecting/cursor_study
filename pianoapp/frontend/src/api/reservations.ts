import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from './client';

export type Reservation = {
  id: string;
  title: string;
  start: string;
  end: string;
  studentId: string;
  roomId: string;
};

export type ReservationsQuery = { start: string; end: string; roomId?: string };

export async function fetchReservations(params: ReservationsQuery): Promise<Reservation[]> {
  const search = new URLSearchParams(params).toString();
  return request<Reservation[]>(`/reservations?${search}`);
}

export function useReservations(params: ReservationsQuery) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => fetchReservations(params),
    enabled: Boolean(params.start && params.end)
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Reservation, 'id'>) =>
      request<Reservation>('/reservations', { method: 'POST', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] })
  });
}

