import { LegalLayout } from "@/components/layout/LegalLayout";
import { Prose, ProseH2 } from "@/components/layout/Prose";
import { LEGAL_META } from "@/data/legal";

export default function TermsPage() {
  const meta = LEGAL_META.terms;
  return (
    <LegalLayout title={meta.title} description={meta.description} keywords={meta.keywords}>
      <Prose>
        {meta.lastUpdated && <p className='text-lg text-muted-foreground'>Last updated: {meta.lastUpdated}</p>}

        <ProseH2>1. Acceptance of terms</ProseH2>
        <p>
          By using Fast Orbit ("the Service") you agree to these terms. If you do not agree, do not use the Service.
        </p>

        <ProseH2>2. Description of service</ProseH2>
        <p>
          Fast Orbit provides tools for data visualisation and graphing. The Service is provided "as is" and "as
          available" without warranties of any kind.
        </p>

        <ProseH2>3. User responsibilities</ProseH2>
        <p>
          You are responsible for the data you upload and the visualisations you create. Do not use the Service for any
          illegal or unauthorised purpose.
        </p>

        <ProseH2>4. Intellectual property</ProseH2>
        <p>
          Fast Orbit owns the Service and its original content, features and functionality. They are protected by
          international copyright, trade mark, patent, trade secret and other intellectual property laws.
        </p>

        <ProseH2>5. Limitation of liability</ProseH2>
        <p>
          Fast Orbit and its directors, employees, partners, agents, suppliers and affiliates are not liable for any
          indirect, incidental, special, consequential or punitive damages.
        </p>
      </Prose>
    </LegalLayout>
  );
}
