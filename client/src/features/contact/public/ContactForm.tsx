import { api } from '@/shared/api/axios';
import { HEADING, TEXT } from '@/shared/constants/style.constants';
import { CheckCircledIcon, EnvelopeClosedIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import {
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  fullName: string;
  email: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!data.message.trim()) errors.message = 'Message cannot be empty.';
  else if (data.message.trim().length < 10)
    errors.message = 'Message must be at least 10 characters.';
  return errors;
}

export default function ContactForm() {
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormState>('idle');

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('loading');

    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm({ fullName: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';

  return (
    <Card size={'3'}>
      <div className="space-y-2">
        <Heading as="h3" size={HEADING.h3.size} weight="bold" className="text-white text-center">
          Contact Form
        </Heading>
        <Text size={TEXT.sm.size} weight="medium">
          Please contact me directly at{' '}
          <Text size={TEXT.sm.size} className="font-extrabold text-(--blue-a11)" as="span">
            muhammadziakhatri@gmail.com
          </Text>{' '}
          or drop your info here.
        </Text>
      </div>

      <Separator my="4" size="4" />

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Callout.Root color="green" variant="surface" size="2">
              <Callout.Icon>
                <CheckCircledIcon width={18} height={18} />
              </Callout.Icon>
              <Callout.Text>Your message was sent! I'll get back to you soon.</Callout.Text>
            </Callout.Root>
            <Button mt="4" variant="ghost" size="2" onClick={() => setStatus('idle')}>
              Send another message
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            noValidate
          >
            <Flex direction="column" gap="4">
              <Flex direction={{ initial: 'column', sm: 'row' }} gap="4">
                {/* Full Name */}
                <Flex direction="column" gap={{ initial: '1' }} flexGrow="1">
                  <Text as="label" size={TEXT.base.size} weight="medium">
                    Full name
                  </Text>
                  <TextField.Root
                    size={TEXT.base.size}
                    placeholder="Your Name"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                    color={errors.fullName ? 'red' : undefined}
                    disabled={isLoading}
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <Text size={TEXT.sm.size} color="red">
                      {errors.fullName}
                    </Text>
                  )}
                </Flex>

                {/* Email */}
                <Flex direction="column" gap={{ initial: '1' }} flexGrow="1">
                  <Text as="label" size={TEXT.base.size} weight="medium">
                    Email Address
                  </Text>
                  <TextField.Root
                    size={TEXT.base.size}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    color={errors.email ? 'red' : undefined}
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                  >
                    <TextField.Slot>
                      <EnvelopeClosedIcon width={14} height={14} />
                    </TextField.Slot>
                  </TextField.Root>
                  {errors.email && (
                    <Text size={TEXT.sm.size} color="red">
                      {errors.email}
                    </Text>
                  )}
                </Flex>
              </Flex>

              {/* Message */}
              <Flex direction="column" gap={{ initial: '1' }}>
                <Text as="label" size={TEXT.base.size} weight="medium">
                  Your Message
                </Text>
                <TextArea
                  size={TEXT.base.size}
                  rows={5}
                  placeholder="Tell me about your project,"
                  value={form.message}
                  onChange={handleChange('message')}
                  color={errors.message ? 'red' : undefined}
                  disabled={isLoading}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <Text size={TEXT.sm.size} color="red">
                    {errors.message}
                  </Text>
                )}
              </Flex>

              <Text size="1" color="blue" weight="medium">
                I'll never share your data with anyone else. Pinky promise!
              </Text>

              {status === 'error' && (
                <Callout.Root color="red" variant="surface" size="1">
                  <Callout.Text>Something went wrong. Please try again.</Callout.Text>
                </Callout.Root>
              )}

              <Button
                type="submit"
                size="3"
                variant="solid"
                disabled={isLoading}
                className="w-full cursor-pointer"
              >
                {isLoading ? (
                  'Sending…'
                ) : (
                  <Flex align="center" gap="2">
                    Send Message
                    <PaperPlaneIcon width={15} height={15} />
                  </Flex>
                )}
              </Button>
            </Flex>
          </motion.form>
        )}
      </AnimatePresence>
    </Card>
  );
}
