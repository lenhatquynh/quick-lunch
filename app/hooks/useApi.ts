'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type {
  MenuWithItems,
  CreateMenuRequest,
  CreateSelectionRequest,
  HistoryMenu,
} from '../lib/types';

export function useActiveMenus() {
  return useQuery<MenuWithItems[]>({
    queryKey: ['activeMenus'],
    queryFn: async () => {
      const { data } = await api.get('/menu/active');
      return data;
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['activeMenus'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      items,
      isLocked,
    }: {
      id: string;
      items?: { id?: string; name: string; notes?: string; maxQuantity?: number | null }[];
      isLocked?: boolean;
    }) => {
      const { data } = await api.put(`/menu/${id}`, { items, isLocked });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
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
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useCreateSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectionData: CreateSelectionRequest) => {
      try {
        const { data } = await api.post('/selection', selectionData);
        return data;
      } catch (error) {
        const axiosError = error as {
          response?: { data?: { error?: string } };
        };
        if (axiosError?.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
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
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useHistory() {
  return useInfiniteQuery({
    queryKey: ['history'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', '10');
      if (pageParam) params.set('cursor', pageParam);
      const { data } = await api.get(`/history?${params.toString()}`);
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
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
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
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
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
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
      queryClient.invalidateQueries({ queryKey: ['menu'] });
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
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
