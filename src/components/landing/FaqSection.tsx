import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import { Grid, GridCell } from "@/components/layout/Grid";
import { SectionHeading } from "@/components/shared/SectionHeading";

const FaqSection = () => {
  return (
    <div id='faq' className='bg-background'>
      <Grid topDivider padding='md'>
        <SectionHeading
          title='Frequently asked'
          accent='questions'
          description='Common questions about Fast Orbit. For data formatting details, see the documentation.'
        />

        <GridCell className='col-span-12 lg:col-span-8 lg:col-start-3'>
          <div className='overflow-hidden rounded-md border-hairline bg-surface-1'>
            <Accordion>
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question} className='border-border'>
                  <AccordionTrigger className='px-6 py-4 text-left text-lg font-medium text-foreground transition-colors hover:text-primary md:px-8'>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className='px-6 pb-4 leading-relaxed text-muted-foreground md:px-8'>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </GridCell>
      </Grid>
    </div>
  );
};

export default FaqSection;
