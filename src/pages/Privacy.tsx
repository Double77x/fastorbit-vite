import { LegalLayout } from "@/components/layout/LegalLayout";
import { Prose, ProseH2 } from "@/components/layout/Prose";
import { LEGAL_META } from "@/data/legal";

export default function PrivacyPage() {
  const meta = LEGAL_META.privacy;
  return (
    <LegalLayout title={meta.title} description={meta.description} keywords={meta.keywords}>
      <Prose>
        {meta.lastUpdated && <p className='text-lg text-muted-foreground'>Last updated: {meta.lastUpdated}</p>}

        <p>This policy explains what information Fast Orbit collects and how we use it.</p>

        <ProseH2>Information we collect</ProseH2>
        <p>We will tell you what we need and why at the point we ask for it.</p>
        <p>
          If you create an account, we may ask for contact details such as your name, company name, address, email
          address and telephone number.
        </p>

        <ProseH2>How we use your information</ProseH2>
        <ul className='list-inside list-disc space-y-2'>
          <li>Provide, operate and maintain the website</li>
          <li>Improve, personalise and expand the website</li>
          <li>Understand and analyse how you use the website</li>
          <li>Develop new products, services and features</li>
          <li>Contact you directly or through a partner</li>
          <li>Send you emails</li>
          <li>Detect and prevent fraud</li>
        </ul>

        <ProseH2>Data security</ProseH2>
        <p>
          We use administrative, technical and physical measures to protect your information. We take reasonable steps
          to keep it secure, but no system or transmission method can be guaranteed to be completely secure.
        </p>
      </Prose>
    </LegalLayout>
  );
}
