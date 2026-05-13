import { useMutation, useQueryClient } from '@tanstack/react-query';

import { NotesClient } from '@/notes/api/NotesClient';
import { NotePayload } from '@/notes/api/types/Note';

interface Options {
  onSuccess: () => void;
}

interface UpdateNoteInput {
  id: string;
  payload: NotePayload;
}

export const useUpdateNote = ({ onSuccess }: Options) => {
  const queryClient = useQueryClient();

  const {
    mutate: updateNote,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ id, payload }: UpdateNoteInput) =>
      NotesClient.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
      onSuccess();
    },
  });

  return { updateNote, isPending, isError };
};
