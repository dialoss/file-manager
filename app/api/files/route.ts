import { NextResponse } from 'next/server';
import { File } from '@/lib/store';
import { getMockFileSystem, getFilesByPath, searchFilesByName } from '@/lib/mock';

import { LRUCache } from 'lru-cache';

const PAGE_SIZE = 50;
const cache = new LRUCache<string, any>({ max: 100, ttl: 1000 * 60 * 5 }); // Cache for 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || String(PAGE_SIZE), 10);
  const searchQuery = searchParams.get('searchQuery') || '';
  const sortBy = searchParams.get('sortBy') as keyof File || 'name';
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc';

  const cacheKey = `${path}-${page}-${pageSize}-${searchQuery}-${sortBy}-${sortOrder}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  // await new Promise(resolve => setTimeout(resolve, 1000));
  let files;

  if (searchQuery) {
    files = searchFilesByName(searchQuery);
  } else {
    files = getFilesByPath(path);
  }

  files.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const total = {
    files: files.filter(file => file.type === 'file').length,
    folders: files.filter(file => file.type === 'folder').length
  };

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const result = {
    files: files.slice(startIndex, endIndex),
    total,
    hasMore: endIndex < files.length
  };

  cache.set(cacheKey, result);

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const file: File = await request.json();
  const mockFileSystem = getMockFileSystem();
  if (!mockFileSystem[file.path]) {
    mockFileSystem[file.path] = [];
  }
  mockFileSystem[file.path].push(file);
  return NextResponse.json({ message: 'File created successfully' }, { status: 201 });
}

export async function PUT(request: Request) {
  const { id, updates }: { id: string; updates: Partial<File> } = await request.json();
  const mockFileSystem = getMockFileSystem();
  for (const path in mockFileSystem) {
    const index = mockFileSystem[path].findIndex(file => file.id === id);
    if (index !== -1) {
      mockFileSystem[path][index] = { ...mockFileSystem[path][index], ...updates };
      return NextResponse.json({ message: 'File updated successfully' });
    }
  }
  return NextResponse.json({ message: 'File not found' }, { status: 404 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const mockFileSystem = getMockFileSystem();
  for (const path in mockFileSystem) {
    const index = mockFileSystem[path].findIndex(file => file.id === id);
    if (index !== -1) {
      mockFileSystem[path].splice(index, 1);
      return NextResponse.json({ message: 'File deleted successfully' });
    }
  }
  return NextResponse.json({ message: 'File not found' }, { status: 404 });
}
