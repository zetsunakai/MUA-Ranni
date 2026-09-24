type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: "h1" | "h2";
};

export default function SectionHeading({ eyebrow, title, description, as: Heading = "h2" }: Props) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">{eyebrow}</p>
      )}
      <Heading className="mt-2 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{title}</Heading>
      {description && <p className="mt-3 text-foreground/75">{description}</p>}
    </div>
  );
}
