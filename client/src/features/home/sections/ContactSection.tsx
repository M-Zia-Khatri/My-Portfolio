import ContactCodeCard from '@/features/contact/public/ContactCodeCard';
import ContactForm from '@/features/contact/public/ContactForm';
import SecComponent from '@/shared/components/SecContainer';
import { Flex } from '@radix-ui/themes';
import { motion } from 'motion/react';
import { useSectionActive } from '../hooks/useSectionActive';

export default function ContactSection() {
  const isSectionActive = useSectionActive('contact');

  return (
    <SecComponent className="w-full">
      <Flex direction="column" align="center" gap="2">
        <div className="mt-4 grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
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
            className="flex-col justify-center hidden lg:flex "
            style={{ perspective: 900 }}
          >
            <ContactCodeCard isActive={isSectionActive} />
          </motion.div>
        </div>
      </Flex>
    </SecComponent>
  );
}
