import { create } from 'zustand';

export interface File {
  id: string;
  name: string;
  createdAt: Date;
  type: 'file' | 'folder';
  url: string;
  thumbnail: string;
  size: number;
  path: string;
  context?: object;
}

interface APIResponse {
  files: File[];
  total: { files: number; folders: number };
  hasMore: boolean;
}

export interface FileAPI {
  getFiles: (path: string, page: number, searchQuery?: string, sortBy?: keyof File, sortOrder?: 'asc' | 'desc', searchInCurrentFolder?: boolean, refresh?: boolean) => Promise<APIResponse>;
  removeFile: (id: string) => Promise<void>;
  createFile: (file: File) => Promise<void>;
  updateFile: (id: string, updates: Partial<File>) => Promise<void>;
}
const cache = new Map<string, APIResponse>();

const BASE_URL = '/api/files';
const fileAPI: FileAPI = {
  getFiles: async (path: string, page: number, searchQuery?: string, sortBy?: keyof File, sortOrder?: 'asc' | 'desc', searchInCurrentFolder?: boolean, refresh?: boolean) => {
    const url = new URL(BASE_URL, window.location.origin);
    url.searchParams.append('path', path);
    url.searchParams.append('page', page.toString());
    if (searchQuery) url.searchParams.append('searchQuery', searchQuery);
    if (sortBy) url.searchParams.append('sortBy', sortBy);
    if (sortOrder) url.searchParams.append('sortOrder', sortOrder);
    url.searchParams.append('searchInCurrentFolder', searchInCurrentFolder ? 'true' : 'false');

    const cacheKey = url.toString();
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse && !refresh) {
      return cachedResponse;
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    cache.set(cacheKey, data);
    return data;
  },
  removeFile: async (id) => {
    const url = new URL(BASE_URL, window.location.origin);
    url.searchParams.append('id', id);
    await fetch(url.toString(), { method: 'DELETE' });
  },
  createFile: async (file) => {
    await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(file)
    });
  },
  updateFile: async (id, updates) => {
    await fetch(BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates })
    });
  },
};

interface FileState {
  files: File[];
  selectedFiles: File[];
  total: { files: number; folders: number };
  setSelectedFiles: (files: File[]) => void;
  toggleSelectedFile: (file: File) => void;
  setTotal: (total: { files: number; folders: number }) => void;
}

interface FileActionState {
  addFile: (file: File) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  updateFile: (id: string, updates: Partial<File>) => Promise<void>;
  refreshFiles: () => Promise<void>;
}

interface ZoomState {
  currentZoom: number;
  setCurrentZoom: (zoom: number) => void;
}

interface NavigationState {
  currentPath: string;
  currentPage: number;
  hasMore: boolean;
  setCurrentPath: (path: string) => void;
  setCurrentPage: (page: number) => void;
  loadMore: () => Promise<void>;
  updateUrlWithCurrentPath: () => void;
  initializeFromUrl: () => void;
}

interface SortState {
  sortOrder: 'asc' | 'desc';
  sortBy: keyof File;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setSortBy: (key: keyof File) => void;
}

interface SearchState {
  searchQuery: string;
  searchInCurrentFolder: boolean;
  setSearchQuery: (query: string) => void;
  setSearchInCurrentFolder: (value: boolean) => void;
}

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const createFileSlice: StateCreator<
  FileState & FileActionState & ZoomState & NavigationState & SortState & SearchState & LoadingState,
  [],
  [],
  FileState
> = (set) => ({
  files: [],
  selectedFiles: [],
  total: { files: 0, folders: 0 },
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  toggleSelectedFile: (file) => set((state) => {
    const index = state.selectedFiles.findIndex(f => f.id === file.id);
    if (index === -1) {
      return { selectedFiles: [...state.selectedFiles, file] };
    } else {
      return { selectedFiles: state.selectedFiles.filter(f => f.id !== file.id) };
    }
  }),
  setTotal: (total) => set({ total }),
});

const createFileActionSlice: StateCreator<
  FileState & FileActionState & ZoomState & NavigationState & SortState & SearchState & LoadingState,
  [],
  [],
  FileActionState
> = (set, get) => ({
  addFile: async (file) => {
    set({ isLoading: true });
    await fileAPI.createFile(file);
    set((state) => ({ files: [...state.files, file], isLoading: false }));
  },
  deleteFile: async (id) => {
    set({ isLoading: true });
    await fileAPI.removeFile(id);
    set((state) => ({ files: state.files.filter(file => file.id !== id), isLoading: false }));
  },
  updateFile: async (id, updates) => {
    set({ isLoading: true });
    await fileAPI.updateFile(id, updates);
    set((state) => ({
      files: state.files.map(file => 
        file.id === id ? { ...file, ...updates } : file
      ),
      isLoading: false
    }));
  },
  refreshFiles: async () => {
    const state = get();
    set({ isLoading: true });
    const response: APIResponse = await fileAPI.getFiles(
      state.currentPath,
      1,
      state.searchQuery,
      state.sortBy,
      state.sortOrder,
      state.searchInCurrentFolder,
      true
    );
    if ('files' in response && Array.isArray(response.files) && 'total' in response) {
      set({
        files: response.files,
        currentPage: 1,
        hasMore: response.hasMore,
        total: response.total,
        isLoading: false
      });
    } else {
      console.error('Unexpected response format from fileAPI.getFiles');
      set({ isLoading: false });
    }
  },
});

const createZoomSlice: StateCreator<
  FileState & FileActionState & ZoomState & NavigationState & SortState & SearchState & LoadingState,
  [],
  [],
  ZoomState
> = (set) => ({
  currentZoom: 0.3,
  setCurrentZoom: (zoom) => set({ currentZoom: zoom }),
});

const createNavigationSlice: StateCreator<
  FileState & FileActionState & ZoomState & NavigationState & SortState & SearchState & LoadingState,
  [],
  [],
  NavigationState
> = (set, get) => ({
  currentPath: '/',
  currentPage: 1,
  hasMore: true,
  setCurrentPath: (path) => {
    set({ currentPath: path });
    get().updateUrlWithCurrentPath();
  },
  setCurrentPage: (page) => set({ currentPage: page }),
  loadMore: async () => {
    const state = get();
    set({ isLoading: true });
    const response: APIResponse = await fileAPI.getFiles(
      state.currentPath,
      state.currentPage,
      state.searchQuery,
      state.sortBy,
      state.sortOrder,
      state.searchInCurrentFolder,
      false
    );
    if ('files' in response && Array.isArray(response.files) && 'total' in response) {
      set({
        files: [...state.files, ...response.files],
        currentPage: state.currentPage + 1,
        hasMore: response.hasMore,
        total: response.total,
        isLoading: false
      });
    } else {
      console.error('Unexpected response format from fileAPI.getFiles');
      set({ isLoading: false });
    }
  },
  updateUrlWithCurrentPath: () => {
    const { currentPath } = get();
    const url = new URL(window.location.href);
    url.searchParams.set('path', currentPath);
    window.history.pushState({}, '', url.toString());
  },
  initializeFromUrl: () => {
    const url = new URL(window.location.href);
    const pathFromUrl = url.searchParams.get('path');
    if (pathFromUrl) {
      set({ currentPath: pathFromUrl });
    }
  },
});

const createSortSlice: StateCreator<
  FileState & FileActionState & ZoomState & NavigationState & SortState & SearchState & LoadingState,
  [],
  [],
  SortState
> = (set) => ({
  sortOrder: 'desc',
  sortBy: 'type',
  setSortOrder: (order) => set({ sortOrder: order }),
  setSortBy: (key) => set({ sortBy: key }),
});

const createSearchSlice: StateCreator<
  FileState & FileActionState & ZoomState & NavigationState & SortState & SearchState & LoadingState,
  [],
  [],
  SearchState
> = (set) => ({
  searchQuery: '',
  searchInCurrentFolder: true,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchInCurrentFolder: (value) => set({ searchInCurrentFolder: value }),
});

const createLoadingSlice: StateCreator<
  FileState & FileActionState & ZoomState & NavigationState & SortState & SearchState & LoadingState,
  [],
  [],
  LoadingState
> = (set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
});

import { persist, createJSONStorage } from 'zustand/middleware';
import { StateCreator } from 'zustand';
import { fa } from '@faker-js/faker';

// Middleware for logging
const logMiddleware = 
  (config: StateCreator<FileState & FileActionState & ZoomState & NavigationState & SortState & SearchState & LoadingState>) => 
  (set: any, get: any, api: any) =>
    config(
      (...args) => {
        set(...args);
      },
      get,
      api
    );

export const useStore = create<
  FileState &
    FileActionState &
    ZoomState &
    NavigationState &
    SortState &
    SearchState &
    LoadingState
>()(
  persist(
    logMiddleware((set, get, api) => ({
      ...createFileSlice(set, get, api),
      ...createFileActionSlice(set, get, api),
      ...createZoomSlice(set, get, api),
      ...createNavigationSlice(set, get, api),
      ...createSortSlice(set, get, api),
      ...createSearchSlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    })),
    {
      name: 'file-manager-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sortOrder: state.sortOrder,
        sortBy: state.sortBy,
        searchQuery: state.searchQuery,
        searchInCurrentFolder: state.searchInCurrentFolder,
        currentZoom: state.currentZoom,
        currentPath: state.currentPath,
      }),
    }
  )
);

function useMulti(useFunc, ...items) {
    return items.reduce((carry, item) => ({
      ...carry,
      [item]: useFunc(state => state[item]),
    }), {})
  }

export const useStoreMulti = (...items) => useMulti(useStore, ...items)