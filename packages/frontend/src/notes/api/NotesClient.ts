import { Response } from '@/common/services/Client';
import { Client } from '@/common/services/Client';
import { Note, NotePayload } from '@/notes/api/types/Note';

export const NotesClient = {
  list: async (): Promise<Note[]> => {
    const { data } = await Client.get<Note[]>({ endpoint: '/notes' });
    return data;
  },
  create: async (payload: NotePayload): Promise<Note> => {
    const { data } = await Client.post<Note, NotePayload>({
      endpoint: '/notes',
      body: payload,
    });
    return data;
  },
  update: async (id: string, payload: NotePayload): Promise<Note> => {
    // Client.put's return type unwraps `data` in the signature but at runtime axios
    // returns the full Response<T> — handle that here without changing the shared helper.
    const response = (await Client.put<Response<Note>, NotePayload>({
      endpoint: `/notes/${id}`,
      body: payload,
    })) as unknown as Response<Note>;
    return response.data;
  },
  remove: async (id: string): Promise<void> => {
    await Client.delete({ endpoint: `/notes/${id}` });
  },
};
