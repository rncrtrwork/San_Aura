import { Header } from '@/components/Header';
import { InfoFooterRow } from '@/components/InfoFooterRow';
import { SiteFooter } from '@/components/SiteFooter';
import { getPublicNavigation } from '@/server/public/getPublicNavigation';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navigation = await getPublicNavigation();

  return (
    <>
      <Header navigation={navigation} />
      <main>{children}</main>
      <div
        className="bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/footer-bg.png')",
          backgroundPosition: 'center 100%',
        }}
      >
        <InfoFooterRow />
        <SiteFooter navigation={navigation} />
      </div>
    </>
  );
}
