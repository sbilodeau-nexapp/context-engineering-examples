import { useMutation, useQueryClient } from '@tanstack/react-query';

import { NotesClient } from '@/notes/api/NotesClient';
import { NotePayload } from '@/notes/api/types/Note';

interface Options {
  onSuccess: () => void;
}

export const useCreateNote = ({ onSuccess }: Options) => {
  const queryClient = useQueryClient();

  const {
    mutate: createNote,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (payload: NotePayload) => NotesClient.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
      onSuccess();
    },
  });

  return { createNote, isPending, isError };
};
