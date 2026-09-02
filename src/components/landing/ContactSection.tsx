import { useState } from "react";
import { Mail, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Grid, GridCell } from "@/components/layout/Grid";
import { siteConfig } from "@/lib/site";

const ContactSection = () => {
  const [copied, setCopied] = useState(false);
  const email = siteConfig.email;

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied to clipboard");

    // Reset icon after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id='contact' className='bg-surface-2'>
      <Grid variant='default' topDivider padding='md'>
        <GridCell className='col-span-12 text-center lg:col-span-8 lg:col-start-3'>
          {/* Header */}
          <div className='mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3'>
            <Mail className='size-6 text-primary' />
          </div>

          <h2 className='mb-6 text-3xl font-semibold text-foreground md:text-4xl'>Still have questions?</h2>

          <p className='mx-auto mb-10 max-w-xl text-lg/relaxed text-muted-foreground'>
            Need help with data security, enterprise features or custom work? Get in touch.
          </p>

          {/* Action Area */}
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            {/* Email Copy Card */}
            <div className='group flex items-center gap-3 rounded-md border-hairline bg-surface-1 py-2 pr-2 pl-4 transition-shadow hover:border-hairline-strong'>
              <span className='text-sm font-medium text-foreground'>{email}</span>
              <div className='h-4 w-px bg-border' />
              <Button
                variant='ghost'
                size='sm'
                className='size-8 p-0 text-muted-foreground hover:text-primary'
                onClick={handleCopy}
                title='Copy Email'>
                {copied ? (
                  <Check className='size-4 text-green-500 animate-in zoom-in' />
                ) : (
                  <Copy className='size-4 transition-transform group-hover:scale-110' />
                )}
              </Button>
            </div>

            <span className='text-sm font-medium text-muted-foreground'>or</span>

            {/* Mailto Button */}
            <a href={`mailto:${email}`}>
              <Button className='gap-2 shadow-lg shadow-primary/20'>
                Send a Message <ArrowRight className='size-4' />
              </Button>
            </a>
          </div>
        </GridCell>
      </Grid>
    </section>
  );
};

export default ContactSection;
