import { Table, Text } from '@radix-ui/themes';
import type { Contact } from '../../types';

interface Props {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
}

export const ContactTable = ({ contacts, onSelect }: Props) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {contacts.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4} align="center">
                <Text color="gray">No contacts found.</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            contacts.map((contact) => (
              <Table.Row
                key={contact.id}
                onClick={() => onSelect(contact)}
                className="cursor-pointer hover:bg-(--blue-2)/50 transition-colors"
              >
                <Table.RowHeaderCell>{contact.full_name}</Table.RowHeaderCell>
                <Table.Cell>{contact.email}</Table.Cell>
                <Table.Cell>{new Date(contact.created_at).toLocaleDateString()}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
};
