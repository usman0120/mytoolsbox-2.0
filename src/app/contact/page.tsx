import { Metadata } from "next";
import { ContactPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with MyToolsBox — questions, feedback, feature requests, or just say hello.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}