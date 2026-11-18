import { redirect } from 'next/navigation';
import { PATHS } from '@/core/routes';

export default function CatalogPage() {
  redirect(PATHS.admin.subjects);
}
