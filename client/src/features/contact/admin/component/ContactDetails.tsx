import { TrashIcon } from '@radix-ui/react-icons';
import { Badge, Box, Button, DataList, Dialog, Flex } from '@radix-ui/themes';
import type { Contact } from '../../types';

interface Props {
  contact: Contact | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const ContactDetails = ({ contact, isOpen, onOpenChange, onDelete, isDeleting }: Props) => {
  if (!contact) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="500px">
        <Dialog.Title>Inquiry Details</Dialog.Title>

        <Box my="4">
          <DataList.Root>
            <DataList.Item align="center">
              <DataList.Label minWidth="88px">From</DataList.Label>
              <DataList.Value>{contact.name}</DataList.Value>
            </DataList.Item>
            <DataList.Item align="center">
              <DataList.Label minWidth="88px">Email</DataList.Label>
              <DataList.Value>{contact.email}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="88px">Subject</DataList.Label>
              <DataList.Value>
                <Badge color="blue" variant="soft">
                  {contact.subject}
                </Badge>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="88px">Message</DataList.Label>
              <DataList.Value>
                <div className="bg-gray-50 p-3 rounded border text-sm whitespace-pre-wrap">
                  {contact.message}
                </div>
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </Box>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Close
            </Button>
          </Dialog.Close>
          <Button color="red" onClick={() => onDelete(contact.id)} loading={isDeleting}>
            <TrashIcon /> Delete
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
