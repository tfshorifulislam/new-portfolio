import { getFaqs } from "@/content";
import { Faq } from "./Faq";

/** Server wrapper: reads the FAQs from the content module and renders the FAQ section. */
export async function FaqSection() {
  const faqs = await getFaqs();
  return <Faq faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />;
}
