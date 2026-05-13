import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { css, Theme } from '@/common/styles/Styles';
import { NotesClient } from '@/notes/api/NotesClient';
import { NoteForm } from '@/notes/components/NoteForm';
import { NotesList } from '@/notes/components/NotesList';

const Notes = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes'],
    queryFn: NotesClient.list,
  });

  return (
    <div className={container}>
      <h2 className={heading}>{t('notesTitle')}</h2>
      <NoteForm />
      {isLoading && <span>{t('notesLoading')}</span>}
      {isError && <span>{t('notesFailedToLoad')}</span>}
      {data && <NotesList notes={data} />}
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
