'use client';

import { useCallback, useEffect } from 'react';
import { useModelStore } from '@/stores/modelStore';
import type { AIModel, ModelType, ModelProvider, ModelStatus, ModelListParams } from '@/types/model';

export function useModels(initialFetch = true) {
  const {
    models,
    selectedModel,
    usageStats,
    isLoading,
    error,
    pagination,
    filters,
    fetchModels,
    fetchModelById,
    fetchUsageStats,
    createModel,
    updateModel,
    deleteModel,
    setSelectedModel,
    setFilters,
    clearError,
  } = useModelStore();

  useEffect(() => {
    if (initialFetch && models.length === 0) {
      fetchModels();
    }
  }, [initialFetch, models.length, fetchModels]);

  const searchModels = useCallback(
    (query: string) => {
      setFilters({ search: query });
      fetchModels({ search: query, page: 1 });
    },
    [setFilters, fetchModels],
  );

  const filterByType = useCallback(
    (type: ModelType | null) => {
      setFilters({ type });
      fetchModels({ type: type ?? undefined, page: 1 });
    },
    [setFilters, fetchModels],
  );

  const filterByProvider = useCallback(
    (provider: ModelProvider | null) => {
      setFilters({ provider });
      fetchModels({ provider: provider ?? undefined, page: 1 });
    },
    [setFilters, fetchModels],
  );

  const filterByStatus = useCallback(
    (status: ModelStatus | null) => {
      setFilters({ status });
      fetchModels({ status: status ?? undefined, page: 1 });
    },
    [setFilters, fetchModels],
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchModels({ page });
    },
    [fetchModels],
  );

  const sortModels = useCallback(
    (sortBy: ModelListParams['sortBy'], sortOrder: ModelListParams['sortOrder'] = 'asc') => {
      setFilters({ sortBy: sortBy ?? 'name', sortOrder });
      fetchModels({ sortBy, sortOrder });
    },
    [setFilters, fetchModels],
  );

  const getModelById = useCallback(
    (id: string) => models.find((m) => m.id === id) ?? null,
    [models],
  );

  const activeModels: AIModel[] = models.filter((m) => m.status === 'active');

  return {
    models,
    activeModels,
    selectedModel,
    usageStats,
    isLoading,
    error,
    pagination,
    filters,
    fetchModels,
    fetchModelById,
    fetchUsageStats,
    createModel,
    updateModel,
    deleteModel,
    setSelectedModel,
    searchModels,
    filterByType,
    filterByProvider,
    filterByStatus,
    goToPage,
    sortModels,
    getModelById,
    setFilters,
    clearError,
  };
}
