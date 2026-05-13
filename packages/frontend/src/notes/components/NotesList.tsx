import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { css, Theme } from '@/common/styles/Styles';
import { Note } from '@/notes/api/types/Note';
import { NoteForm } from '@/notes/components/NoteForm';
import { useDeleteNote } from '@/notes/hooks/useDeleteNote';

interface NotesListProps {
  notes: Note[];
}

export const NotesList = ({ notes }: NotesListProps) => {
  const { t } = useTranslation();

  if (notes.length === 0) {
    return <span>{t('notesEmpty')}</span>;
  }

  return (
    <ul className={list}>
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </ul>
  );
};

const NoteItem = ({ note }: { note: Note }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const { deleteNote, isPending } = useDeleteNote();

  if (isEditing) {
    return (
      <li className={item}>
        <NoteForm note={note} onDone={() => setIsEditing(false)} />
      </li>
    );
  }

  return (
    <li className={item}>
      <h3 className={title}>{note.title}</h3>
      <p className={content}>{note.content}</p>
      <div className={actions}>
        <button type="button" onClick={() => setIsEditing(true)}>
          {t('notesActionEdit')}
        </button>
        <button
          type="button"
          onClick={() => deleteNote(note.id)}
          disabled={isPending}
        >
          {t('notesActionDelete')}
        </button>
      </div>
    </li>
  );
};

const list = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const item = css((theme: Theme) => ({
  padding: 12,
  border: `1px solid ${theme.palette.background.tertiary}`,
  borderRadius: 4,
  backgroundColor: theme.palette.background.primary,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}));

const title = css((theme: Theme) => ({
  color: theme.palette.text.primary,
  margin: 0,
  fontSize: 16,
}));

const content = css((theme: Theme) => ({
  color: theme.palette.text.secondary,
  margin: 0,
  whiteSpace: 'pre-wrap',
}));

const actions = css`
  display: flex;
  gap: 8px;
`;
