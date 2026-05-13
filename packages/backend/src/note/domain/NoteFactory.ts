import { v4 as uuid } from 'uuid';

import { Note } from './Note';

export const NoteFactory = {
  create: ({ title, content }: { title: string; content: string }) => {
    const now = new Date();
    return new Note({
      id: uuid(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
    });
  },
};
