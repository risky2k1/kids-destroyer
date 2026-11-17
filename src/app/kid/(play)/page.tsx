import { getCurrentKid } from '@/packages/family';

export default async function KidHome() {
  const kid = await getCurrentKid();
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <p className="text-3xl font-bold">
        Chào {kid?.displayName} {kid?.avatar}!
      </p>
      <p className="text-xl">Chưa có bài nào. Đi chơi đi 🎉</p>
    </div>
  );
}
