import { useQuery } from '@tanstack/react-query';

import { NotesClient } from '@/notes/api/NotesClient';

export const useNotes = () => {
  const {
    data: notes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: () => NotesClient.list(),
  });

  return { notes, isLoading, isError };
};
