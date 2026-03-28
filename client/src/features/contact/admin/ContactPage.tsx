import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Box, Callout, Flex, Heading, Spinner } from '@radix-ui/themes';
import { useMemo, useState } from 'react';
import { useContacts, useDeleteContact } from '../api';
import type { Contact } from '../types';
import { ContactDetails } from './component/ContactDetails';
import { ContactFilters } from './component/ContactFilters';
import { ContactTable } from './component/ContactTable';

export default function ContactPage() {
  const { data: contacts, isLoading, isError, error } = useContacts();
  const deleteMutation = useDeleteContact();

  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Client-side filtering
  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await deleteMutation.mutateAsync(id);
      setSelectedContact(null);
    }
  };

  if (isLoading)
    return (
      <Flex p="9" justify="center">
        <Spinner size="3" />
      </Flex>
    );

  if (isError)
    return (
      <Box p="6">
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{error instanceof Error ? error.message : 'Failed to fetch'}</Callout.Text>
        </Callout.Root>
      </Box>
    );

  return (
    <Box p="6">
      <Heading mb="4">Contact Submissions</Heading>

      <ContactFilters value={search} onChange={setSearch} resultsCount={filteredContacts.length} />

      <ContactTable contacts={filteredContacts} onSelect={setSelectedContact} />

      <ContactDetails
        contact={selectedContact}
        isOpen={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
}
