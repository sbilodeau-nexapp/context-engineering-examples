import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { css, Theme } from '@/common/styles/Styles';
import { NotesClient } from '@/notes/api/NotesClient';
import { Note } from '@/notes/api/types/Note';

interface NoteFormProps {
  note?: Note;
  onDone?: () => void;
}

export const NoteForm = ({ note, onDone }: NoteFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');

  const isEditing = note !== undefined;

  const mutation = useMutation({
    mutationFn: (payload: { title: string; content: string }) =>
      isEditing
        ? NotesClient.update(note.id, payload)
        : NotesClient.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (!isEditing) {
        setTitle('');
        setContent('');
      }
      onDone?.();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    mutation.mutate({ title: title.trim(), content: content.trim() });
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
        <button type="submit" disabled={mutation.isPending}>
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
