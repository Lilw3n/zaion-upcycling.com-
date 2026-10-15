import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <>
      <Header session={session} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
