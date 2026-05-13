import type { Note } from './Note';

export abstract class NoteRepository {
  public abstract getAllNotes(): Promise<Note[]>;
  public abstract getNoteById(id: string): Promise<Note | null>;
  public abstract createNote(note: Note): Promise<void>;
  public abstract updateNote(
    id: string,
    title: string,
    content: string,
    updatedAt: Date,
  ): Promise<void>;
  public abstract deleteNote(id: string): Promise<void>;
}
