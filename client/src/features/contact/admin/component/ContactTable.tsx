/**
 * ContactTable.tsx
 *
 * Optimization: virtual rows for large contact lists.
 *
 * A portfolio admin panel could accumulate hundreds of contact submissions.
 * Rendering all of them as `<Table.Row>` DOM nodes causes:
 *   • Slow initial paint (layout pass over all rows)
 *   • Sluggish scrolling (browser paints invisible rows)
 *   • Memory pressure (each Radix row renders ~6 DOM elements)
 *
 * Solution: render only the rows visible inside the fixed-height container
 * (plus OVERSCAN rows for smooth scroll).  All other rows are represented
 * by a height-only spacer — zero DOM nodes, zero paint cost.
 *
 * THRESHOLD: below VIRTUAL_THRESHOLD rows, the full table renders normally
 * to avoid unnecessary complexity for typical small datasets.
 *
 * KNOWN TRADE-OFF: Radix Table's built-in zebra-striping and column widths
 * apply only to visible rows.  Column widths are pinned via `minWidth` to
 * prevent layout jitter as rows enter/leave the virtual window.
 */

import { Table, Text } from '@radix-ui/themes';
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from 'react';
import type { Contact } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────
const VIRTUAL_THRESHOLD = 40;
const ROW_HEIGHT_PX     = 44;
const CONTAINER_HEIGHT  = 480;
const OVERSCAN          = 3;

// ─── Memoised row ─────────────────────────────────────────────────────────────
const ContactRow = memo(function ContactRow({
  contact,
  onSelect,
}: {
  contact: Contact;
  onSelect: (c: Contact) => void;
}) {
  const handleClick = useCallback(() => onSelect(contact), [contact, onSelect]);

  return (
    <Table.Row
      onClick={handleClick}
      className="cursor-pointer hover:bg-(--blue-2)/50 transition-colors"
      style={{ height: ROW_HEIGHT_PX }}
    >
      <Table.RowHeaderCell style={{ minWidth: 140 }}>
        {contact.full_name}
      </Table.RowHeaderCell>
      <Table.Cell style={{ minWidth: 200 }}>{contact.email}</Table.Cell>
      <Table.Cell style={{ minWidth: 100 }}>
        {new Date(contact.created_at).toLocaleDateString()}
      </Table.Cell>
    </Table.Row>
  );
});

// ─── Virtual body ─────────────────────────────────────────────────────────────
const VirtualContactBody = memo(function VirtualContactBody({
  contacts,
  onSelect,
}: {
  contacts: Contact[];
  onSelect: (c: Contact) => void;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { startIdx, visibleContacts } = useMemo(() => {
    const visibleCount = Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT_PX);
    const rawStart     = Math.floor(scrollTop / ROW_HEIGHT_PX);
    const startIdx     = Math.max(0, rawStart - OVERSCAN);
    const endIdx       = Math.min(contacts.length - 1, rawStart + visibleCount + OVERSCAN);
    return { startIdx, visibleContacts: contacts.slice(startIdx, endIdx + 1) };
  }, [scrollTop, contacts]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}
      onScroll={handleScroll}
    >
      {/* Full-height spacer keeps scroll range accurate */}
      <div style={{ height: contacts.length * ROW_HEIGHT_PX, position: 'relative' }}>
        {/* Translate the visible slice to its correct absolute position */}
        <div style={{ transform: `translateY(${startIdx * ROW_HEIGHT_PX}px)` }}>
          <Table.Root variant="surface">
            <Table.Body>
              {visibleContacts.map((contact) => (
                <ContactRow key={contact.id} contact={contact} onSelect={onSelect} />
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </div>
  );
});

// ─── ContactTable ─────────────────────────────────────────────────────────────
export interface ContactTableProps {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
}

export const ContactTable = memo(function ContactTable({
  contacts,
  onSelect,
}: ContactTableProps) {
  // Shared header rendered above both virtual and standard list
  const header = (
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
      </Table.Row>
    </Table.Header>
  );

  if (contacts.length === 0) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table.Root variant="surface">
          {header}
          <Table.Body>
            <Table.Row>
              <Table.Cell colSpan={3} align="center">
                <Text color="gray">No contacts found.</Text>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {contacts.length > VIRTUAL_THRESHOLD ? (
        /**
         * Virtual path: sticky Radix header + scrollable virtual body.
         * The header is outside the scrollable container so it stays visible.
         */
        <>
          <Table.Root variant="surface">{header}</Table.Root>
          <VirtualContactBody contacts={contacts} onSelect={onSelect} />
        </>
      ) : (
        /**
         * Standard path: full Radix Table for small lists.
         * Same markup as original — no behaviour changes.
         */
        <Table.Root variant="surface">
          {header}
          <Table.Body>
            {contacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} onSelect={onSelect} />
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </div>
  );
});