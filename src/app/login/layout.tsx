import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Briana Dental Clinic Management",
  description: "Login to the clinic management system",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
