import { useTranslation } from 'react-i18next';

import { css, Theme } from '@/common/styles/Styles';
import { NoteForm } from '@/notes/components/NoteForm';
import { NotesList } from '@/notes/components/NotesList';
import { useNotes } from '@/notes/hooks/useNotes';

const Notes = () => {
  const { t } = useTranslation();
  const { notes, isLoading, isError } = useNotes();

  return (
    <div className={container}>
      <h2 className={heading}>{t('notesTitle')}</h2>
      <NoteForm />
      {isLoading && <span>{t('notesLoading')}</span>}
      {isError && <span>{t('notesFailedToLoad')}</span>}
      {notes && <NotesList notes={notes} />}
    </div>
  );
};

const container = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const heading = css((theme: Theme) => ({
  color: theme.palette.text.primary,
  margin: 0,
}));

export default Notes;
