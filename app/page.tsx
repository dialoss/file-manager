
import FileManager from "@/components/FileManager";
import { cookies } from 'next/headers';
import Auth from '@/components/Auth';

export const metadata = {
  title: 'Файловый менеджер',
  description: 'Файловый менеджер',
}

export default function Home() {
  // const cookieStore = cookies();
  // const savedPassword = cookieStore.get('password')?.value || '';

  // if (savedPassword !== process.env.PASSWORD) {
  //   return <Auth /> 
  // }

  return (
    <main className="h-screen">
      <FileManager />
    </main>
  );
}
