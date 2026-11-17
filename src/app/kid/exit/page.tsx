import { ExitForm } from '@/packages/family';

export default function KidExitPage() {
  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="text-center text-2xl">Bố/mẹ nhập mật khẩu để thoát</h1>
      <ExitForm />
    </div>
  );
}
