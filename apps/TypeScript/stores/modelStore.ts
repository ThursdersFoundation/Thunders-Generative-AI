import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AIModel, ModelListParams, ModelUsageStats, ModelType, ModelProvider, ModelStatus } from '@/types/model';
import { get, post, put, del } from '@/services/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

interface ModelState {
  models: AIModel[];
  selectedModel: AIModel | null;
  usageStats: Map<string, ModelUsageStats>;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  filters: {
    search: string;
    type: ModelType | null;
    provider: ModelProvider | null;
    status: ModelStatus | null;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };

  fetchModels: (params?: Partial<ModelListParams>) => Promise<void>;
  fetchModelById: (id: string) => Promise<void>;
  fetchUsageStats: (modelId: string) => Promise<void>;
  createModel: (data: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'requestCount' | 'avgLatencyMs'>) => Promise<AIModel>;
  updateModel: (id: string, data: Partial<AIModel>) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
  setSelectedModel: (model: AIModel | null) => void;
  setFilters: (filters: Partial<ModelState['filters']>) => void;
  clearError: () => void;
}

export const useModelStore = create<ModelState>()(
  devtools(
    (set, get) => ({
      models: [],
      selectedModel: null,
      usageStats: new Map(),
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        pageSize: 12,
        totalItems: 0,
        totalPages: 0,
      },
      filters: {
        search: '',
        type: null,
        provider: null,
        status: null,
        sortBy: 'name',
        sortOrder: 'asc',
      },

      fetchModels: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const { filters, pagination } = get();
          const queryParams: ModelListParams = {
            page: params?.page ?? pagination.page,
            pageSize: params?.pageSize ?? pagination.pageSize,
            search: params?.search ?? filters.search || undefined,
            type: params?.type ?? filters.type ?? undefined,
            provider: params?.provider ?? filters.provider ?? undefined,
            status: params?.status ?? filters.status ?? undefined,
            sortBy: (params?.sortBy ?? filters.sortBy) as ModelListParams['sortBy'],
            sortOrder: (params?.sortOrder ?? filters.sortOrder) as ModelListParams['sortOrder'],
          };
          const response = await get<PaginatedResponse<AIModel>>('/models', { params: queryParams as Record<string, string> });
          set({
            models: response.data,
            pagination: {
              page: response.pagination.page,
              pageSize: response.pagination.pageSize,
              totalItems: response.pagination.totalItems,
              totalPages: response.pagination.totalPages,
            },
            isLoading: false,
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to fetch models';
          set({ error: message, isLoading: false });
        }
      },

      fetchModelById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await get<ApiResponse<AIModel>>(`/models/${id}`);
          set({ selectedModel: response.data, isLoading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to fetch model';
          set({ error: message, isLoading: false });
        }
      },

      fetchUsageStats: async (modelId) => {
        try {
          const response = await get<ApiResponse<ModelUsageStats>>(`/models/${modelId}/stats`);
          set((state) => {
            const updated = new Map(state.usageStats);
            updated.set(modelId, response.data);
            return { usageStats: updated };
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to fetch usage stats';
          set({ error: message });
        }
      },

      createModel: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await post<ApiResponse<AIModel>>('/models', data);
          set((state) => ({
            models: [...state.models, response.data],
            isLoading: false,
          }));
          return response.data;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to create model';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      updateModel: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await put<ApiResponse<AIModel>>(`/models/${id}`, data);
          set((state) => ({
            models: state.models.map((m) => (m.id === id ? response.data : m)),
            selectedModel: state.selectedModel?.id === id ? response.data : state.selectedModel,
            isLoading: false,
          }));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to update model';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      deleteModel: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await del(`/models/${id}`);
          set((state) => ({
            models: state.models.filter((m) => m.id !== id),
            selectedModel: state.selectedModel?.id === id ? null : state.selectedModel,
            isLoading: false,
          }));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to delete model';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      setSelectedModel: (model) => set({ selectedModel: model }),

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'ModelStore' },
  ),
);
