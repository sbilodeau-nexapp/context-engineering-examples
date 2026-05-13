import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { css, Theme } from '@/common/styles/Styles';
import { Note } from '@/notes/api/types/Note';
import { useCreateNote } from '@/notes/hooks/useCreateNote';
import { useUpdateNote } from '@/notes/hooks/useUpdateNote';

interface NoteFormProps {
  note?: Note;
  onDone?: () => void;
}

export const NoteForm = ({ note, onDone }: NoteFormProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');

  const isEditing = note !== undefined;

  const { createNote, isPending: isCreating } = useCreateNote({
    onSuccess: () => {
      setTitle('');
      setContent('');
      onDone?.();
    },
  });

  const { updateNote, isPending: isUpdating } = useUpdateNote({
    onSuccess: () => onDone?.(),
  });

  const isPending = isCreating || isUpdating;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const payload = { title: title.trim(), content: content.trim() };
    if (isEditing) {
      updateNote({ id: note.id, payload });
    } else {
      createNote(payload);
    }
  };

  return (
    <form className={form} onSubmit={handleSubmit}>
      <input
        className={input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('notesTitlePlaceholder')}
        aria-label={t('notesTitlePlaceholder')}
      />
      <textarea
        className={textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('notesContentPlaceholder')}
        aria-label={t('notesContentPlaceholder')}
      />
      <div className={actions}>
        <button type="submit" disabled={isPending}>
          {isEditing ? t('notesActionSave') : t('notesActionCreate')}
        </button>
        {isEditing && (
          <button type="button" onClick={() => onDone?.()}>
            {t('notesActionCancel')}
          </button>
        )}
      </div>
    </form>
  );
};

const form = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 480px;
`;

const input = css((theme: Theme) => ({
  padding: 8,
  fontSize: 14,
  border: `1px solid ${theme.palette.background.tertiary}`,
  borderRadius: 4,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.primary,
}));

const textarea = css((theme: Theme) => ({
  padding: 8,
  fontSize: 14,
  minHeight: 80,
  fontFamily: 'inherit',
  border: `1px solid ${theme.palette.background.tertiary}`,
  borderRadius: 4,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.primary,
}));

const actions = css`
  display: flex;
  gap: 8px;
`;
