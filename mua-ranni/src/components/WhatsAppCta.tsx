import { ChatIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  title: string;
  description: string;
  message?: string;
};

export default function WhatsAppCta({ title, description, message }: Props) {
  return (
    <div className="rounded-xl bg-accent-soft px-5 py-8 text-center sm:px-10">
      <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-foreground/75">{description}</p>
      <a
        href={whatsappUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-strong px-6 py-3 font-medium text-white transition-colors hover:bg-foreground"
      >
        <ChatIcon />
        Chat WhatsApp
      </a>
    </div>
  );
}
