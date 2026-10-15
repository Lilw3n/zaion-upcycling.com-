import { CookieNotice } from "@/components/cookie-notice";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteJsonLd } from "@/components/site-jsonld";
import { ensureCatalog } from "@/db/ensure";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  await ensureCatalog();
  const session = await getSession();
  return (
    <>
      <SiteJsonLd />
      <Header session={session} />
      <main>{children}</main>
      <Footer />
      <CookieNotice />
    </>
  );
}
