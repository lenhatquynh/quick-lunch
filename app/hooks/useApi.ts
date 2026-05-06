'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type {
  MenuWithItems,
  CreateMenuRequest,
  CreateSelectionRequest,
  HistoryMenu,
} from '../lib/types';

export function useTodayMenu() {
  return useQuery<MenuWithItems | null>({
    queryKey: ['todayMenu'],
    queryFn: async () => {
      const { data } = await api.get('/menu');
      return data;
    },
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuData: CreateMenuRequest) => {
      const { data } = await api.post('/menu', menuData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; isLocked?: boolean }) => {
      const { data } = await api.put(`/menu/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useCreateSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectionData: CreateSelectionRequest) => {
      const { data } = await api.post('/selection', selectionData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
    },
  });
}

export function useDeleteSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ selectionId, menuItemId, personName }: { selectionId?: string; menuItemId?: string; personName?: string }) => {
      const params = new URLSearchParams();
      if (selectionId) params.append('selectionId', selectionId);
      if (menuItemId) params.append('menuItemId', menuItemId);
      if (personName) params.append('personName', personName);
      const { data } = await api.delete(`/selection?${params.toString()}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
    },
  });
}

export function useHistory() {
  return useQuery<HistoryMenu[]>({
    queryKey: ['history'],
    queryFn: async () => {
      const { data } = await api.get('/history');
      return data;
    },
  });
}

export function useMenuDetail(id: string) {
  return useQuery<MenuWithItems>({
    queryKey: ['menu', id],
    queryFn: async () => {
      const { data } = await api.get(`/menu/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItemId, personName }: { menuItemId: string; personName: string }) => {
      const { data } = await api.post('/payment', { menuItemId, personName });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
    },
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItemId, personName }: { menuItemId: string; personName: string }) => {
      const params = new URLSearchParams();
      params.append('menuItemId', menuItemId);
      params.append('personName', personName);
      const { data } = await api.delete(`/payment?${params.toString()}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
    },
  });
}

export function useConfirmAllPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId, personName }: { menuId: string; personName: string }) => {
      const { data } = await api.post('/payment/confirm-all', { menuId, personName });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useCancelAllPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId, personName }: { menuId: string; personName: string }) => {
      const params = new URLSearchParams();
      params.append('menuId', menuId);
      params.append('personName', personName);
      const { data } = await api.delete(`/payment/cancel-all?${params.toString()}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMenu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
