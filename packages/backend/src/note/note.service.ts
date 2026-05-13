import { Injectable, NotFoundException } from '@nestjs/common';

import type { Note } from './domain/Note';
import { NoteRepository } from './domain/note.repository';
import { NoteFactory } from './domain/NoteFactory';

@Injectable()
export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}
  list(): Promise<Note[]> {
    return this.noteRepository.getAllNotes();
  }
  async getById(id: string): Promise<Note> {
    const note = await this.noteRepository.getNoteById(id);
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    return note;
  }
  async create({ title, content }: { title: string; content: string }) {
    const note = NoteFactory.create({ title, content });
    await this.noteRepository.createNote(note);
    return note;
  }
  async update(
    id: string,
    { title, content }: { title: string; content: string },
  ) {
    await this.getById(id);
    const updatedAt = new Date();
    await this.noteRepository.updateNote(id, title, content, updatedAt);
    return this.getById(id);
  }
  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.noteRepository.deleteNote(id);
  }
}
