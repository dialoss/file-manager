import { File } from './store';
import { faker } from '@faker-js/faker';

let all: File[] = [];
let cache: { [key: string]: File[] } = {};

const generateMockFile = (id: string, type: 'file' | 'folder', path: string): File => ({
  id,
  name: type === 'folder' ? faker.system.directoryPath().split('/').pop()! : faker.system.fileName(),
  createdAt: faker.date.past(),
  type,
  url: type === 'file' ? faker.internet.url() : '',
  thumbnail: type === 'file' ? faker.image.url() : '',
  size: type === 'file' ? faker.number.int({ min: 1000, max: 1000000 }) : 0,
  path,
});
const generateFiles = (path: string): File[] => {
  const files: File[] = [];
  const itemCount = faker.number.int({ min: 50, max: 200 }); // 100 items for root, 5-20 for others
  const maxFolders = faker.number.int({ min: 10, max: 50 });;
  let folderCount = 0;

  for (let i = 0; i < itemCount; i++) {
    const id = faker.string.uuid();
    const isFolder = folderCount < maxFolders && (path === '/' ? i < 10 : faker.datatype.boolean());
    const type = isFolder ? 'folder' : 'file';
    const file = generateMockFile(id, type, path);
    files.push(file);

    if (isFolder) {
      folderCount++;
      const folderPath = `${path}${file.name}/`;
      cache[folderPath] = []; // Initialize empty folder in cache
    }
    all.push(file);
  }

  return files;
};

export const getMockFileSystem = () => cache;

export const getFilesByPath = (path: string): File[] => {
  if (cache[path]) {
    return cache[path];
  }
  const files = generateFiles(path);
  cache[path] = files;
  return files;
};

export const searchFilesByName = (query: string): File[] => {
  return all.filter(file => 
    file.name.toLowerCase().includes(query.toLowerCase())
  );
};
