import { useMutation, useQueryClient } from '@tanstack/react-query';

import { NotesClient } from '@/notes/api/NotesClient';

interface Options {
  onSuccess?: () => void;
}

export const useDeleteNote = ({ onSuccess }: Options = {}) => {
  const queryClient = useQueryClient();

  const {
    mutate: deleteNote,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (id: string) => NotesClient.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
      onSuccess?.();
    },
  });

  return { deleteNote, isPending, isError };
};
