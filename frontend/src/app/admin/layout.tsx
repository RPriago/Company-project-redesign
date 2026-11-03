import { headers } from "next/headers";
export const dynamic = "force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}) {
  await headers();
  return children;
}
