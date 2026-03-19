import { motion } from "motion/react";
import { Flex, Heading } from "@radix-ui/themes";
import SecComponent from "@/shared/components/SecContainer";
import { HEADING } from "@/shared/constants/style.constants";
import ContactForm from "../../contact/ContactForm";
import ContactCodeCard from "../../contact/ContactCodeCard";

export default function ContactSection() {
  return (
    <SecComponent className="w-full">
      <Flex direction="column" align="center" gap="2">
        <Heading as="h2" size={HEADING.h2.size} className="font-bold">
          Contact
        </Heading>

        <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Contact Form ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ContactForm />
          </motion.div>

          {/* ── Showcase: ContactCodeCard ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col justify-center"
            style={{ perspective: 900 }}
          >
            <ContactCodeCard />
          </motion.div>
        </div>
      </Flex>
    </SecComponent>
  );
}