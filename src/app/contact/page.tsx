import { Metadata } from "next";
import { redirect } from "next/navigation";
import { CONTACT_URL } from "@/config/site";
import { ContactPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with MyToolsBox for questions, feedback or tool requests.",
};

export default function ContactPage() {
  // Once the external contact hub is ready, /contact forwards there.
  if (CONTACT_URL) redirect(CONTACT_URL);
  return <ContactPageClient />;
}
