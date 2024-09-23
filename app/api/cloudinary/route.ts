import { NextResponse } from 'next/server';
import { File } from '@/lib/store';
import { v2 as cloudinary } from 'cloudinary';
import { LRUCache } from 'lru-cache';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const PAGE_SIZE = 50;
const cursorCache = new LRUCache<string, string>({ max: 1000, ttl: 1000 * 60 * 60 }); // Cache cursors for 1 hour
const folderCount: { [key: string]: number } = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let path = searchParams.get('path') || '/';
  path = decodeURI(path)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('searchQuery') || '';
  let sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc';
  const searchInCurrentFolder = searchParams.get('searchInCurrentFolder') === 'true';
  if (sortBy === "createdAt") {
    sortBy = "created_at";
  }
  if (sortBy === "size") {
    sortBy = "bytes";
  }
  if (sortBy === "name") {
    sortBy = "filename";
  }
  if (path[0] === '/') {
    path = path.substring(1);
  }
  try {
    const cursorKey = `${path}-${searchQuery}-${sortBy}-${sortOrder}-${searchInCurrentFolder}`;
    let nextCursor = cursorCache.get(cursorKey);

    if (page > 1 && !nextCursor) {
      return NextResponse.json({ error: 'Invalid page request' }, { status: 400 });
    }

    let expression = ``;
    if (searchQuery) {
      expression += `filename=${searchQuery}*`;
    }
    if (searchInCurrentFolder) {
      expression += (expression ? " AND " : "") + `folder="${path}"`;
    }

    const [filesResponse, foldersResponse] = await Promise.all([
      cloudinary.search
        .expression(expression)
        .max_results(PAGE_SIZE)
        .fields('context')
        .fields('bytes')
        .fields('public_url')
        .fields('secure_url')
        .next_cursor(nextCursor)
        .sort_by(sortBy, sortOrder)
        .execute(),
      page === 1 ? cloudinary.api.sub_folders(path) : Promise.resolve({ folders: [], total_count: folderCount[path] || 0 })
    ]);

    folderCount[path] = foldersResponse.total_count;
    const mapResourceToFile = (resource: any, path: string): File => {
      let ext = resource.public_id.split('/').pop().includes('.') ? resource.public_id.split('.').pop() : '';
      if (!['jpg', 'png', 'webp'].includes(ext)) ext = ".png";
      else ext = "." + ext;
      return {
        id: resource.public_id,
        name: resource.public_id.split('/').pop(),
        createdAt: new Date(resource.created_at),
        type: 'file',
        url: resource.secure_url,
        thumbnail: cloudinary.url(resource.public_id + ext, { width: 400, height: 400, crop: 'fill' }),
        size: resource.context && resource.context.size ? Number(resource.context.size) : resource.bytes,
        path: !searchQuery ? '/' + path : '/' + resource.folder,
        context: resource.context,
      }
    }

    const files: File[] = filesResponse.resources.map((resource: any) => mapResourceToFile(resource, path));
    let folders: File[] = foldersResponse.folders.map((folder: any) => ({
      id: folder.path,
      name: folder.name,
      createdAt: null,
      type: 'folder',
      url: '',
      thumbnail: '',
      size: 0,
      path: '/' + path,
    }));
    if (searchQuery) {
      folders = folders.filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    const allItems = [...folders, ...files];
    const total = {
      files: filesResponse.total_count,
      folders: foldersResponse.total_count,
    };

    const result = {
      files: allItems,
      total,
      hasMore: !!filesResponse.next_cursor,
    };

    // Save the next cursor for the next page
    if (filesResponse.next_cursor) {
      cursorCache.set(cursorKey, filesResponse.next_cursor);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching files and folders from Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to fetch files and folders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const file: File = await request.json();
  try {
    if (file.type === 'folder') {
      const result = await cloudinary.api.create_folder(file.path);
      
      return NextResponse.json({ message: 'Folder created successfully', file: result }, { status: 201 });
    }
    const result = await cloudinary.uploader.upload(file.url, {
      public_id: file.name,
      folder: file.path.substring(1),
    });
    return NextResponse.json({ message: 'File created successfully', file: result }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { id, updates }: { id: string; updates: Partial<File> } = await request.json();
  try {
    const result = await cloudinary.uploader.rename(id, updates.id || id, { overwrite: true });
    return NextResponse.json({ message: 'File updated successfully', file: result });
  } catch (error) {
    console.error('Error updating file in Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }
  try {
    const result = await cloudinary.uploader.destroy(id);
    if (result.result === 'ok') {
      return NextResponse.json({ message: 'File deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete file ' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
