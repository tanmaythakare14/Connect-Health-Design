import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * shadcn/ui Sonner, adapted for this project: shadcn's stock version reads the
 * theme from next-themes, which isn't used here — the theme is passed in from
 * the Redux-backed app shell instead. Colours come from our tokens via the
 * [data-sonner-toaster] override in src/index.css (no inline styles).
 */
function Toaster({ ...props }: ToasterProps) {
  return <Sonner className="toaster group" {...props} />;
}

export { Toaster };
