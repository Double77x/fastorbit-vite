import { features } from "@/data/features";
import { Grid } from "@/components/layout/Grid";
import { SectionHeading } from "@/components/shared/SectionHeading";

const FeaturesSection = () => {
  return (
    <section id='features' className='scroll-mt-24'>
      <Grid variant='muted' topDivider>
        <SectionHeading
          title='Everything you need to'
          accent='ship fast'
          description='A thin, typed starter. No extra server, no hidden state, just the pieces that stay useful after the demo.'
        />

        {features.map((feature, index) => (
          <div
            key={feature.title}
            className='group col-span-12 rounded-md border-hairline bg-surface-1 p-6 transition-shadow duration-300 hover:border-hairline-strong hover:bg-surface-2 sm:col-span-6 lg:col-span-4'
            style={{ animationDelay: `${index * 0.1}s` }}>
            <div className='mb-4 flex size-12 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/20'>
              {feature.icon}
            </div>
            <h3 className='mb-3 text-xl font-semibold text-card-foreground'>{feature.title}</h3>
            <p className='leading-relaxed text-muted-foreground'>{feature.description}</p>
          </div>
        ))}
      </Grid>
    </section>
  );
};

export default FeaturesSection;
