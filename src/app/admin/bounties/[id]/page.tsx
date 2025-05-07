import AdminBountyDetailClient from '@/app/admin/bounties/[id]/AdminBountyDetailClient';

export default async function Page({ params }: { params: { id: string } }) {
  return <AdminBountyDetailClient id={params.id} />;
}