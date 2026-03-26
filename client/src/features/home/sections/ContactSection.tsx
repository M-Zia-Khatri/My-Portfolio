import SecComponent from '@/shared/components/SecContainer';
import { HEADING } from '@/shared/constants/style.constants';
import { Flex, Heading } from '@radix-ui/themes';
import { motion } from 'motion/react';
import ContactCodeCard from '../../contact/ContactCodeCard';
import ContactForm from '../../contact/ContactForm';

export default function ContactSection() {
  return (
    <SecComponent className="w-full">
      <Flex direction="column" align="center" gap="2">
        <Heading as="h2" size={HEADING.h2.size} className="font-bold">
          Contact
        </Heading>

        <div className="mt-4 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {/* ── Contact Form ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <ContactForm />
          </motion.div>

          {/* ── Showcase: ContactCodeCard ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
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
