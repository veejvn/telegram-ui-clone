import ContactClientLayout from "@/components/layouts/ContactClientLayout";

export default function ContactLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return <ContactClientLayout>{children}</ContactClientLayout>;
  }