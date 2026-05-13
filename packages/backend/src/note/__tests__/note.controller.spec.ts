import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { Note } from '../domain/Note';
import { NoteRepository } from '../domain/note.repository';
import { NoteController } from '../note.controller';
import { NoteService } from '../note.service';

class InMemoryNoteRepository implements NoteRepository {
  private readonly store = new Map<string, Note>();
  async getAllNotes() {
    return [...this.store.values()];
  }
  async getNoteById(id: string) {
    return this.store.get(id) ?? null;
  }
  async createNote(note: Note) {
    this.store.set(note.id, note);
  }
  async updateNote(
    id: string,
    title: string,
    content: string,
    updatedAt: Date,
  ) {
    const existing = this.store.get(id);
    if (!existing) return;
    this.store.set(
      id,
      new Note({
        id,
        title,
        content,
        createdAt: existing.createdAt,
        updatedAt,
      }),
    );
  }
  async deleteNote(id: string) {
    this.store.delete(id);
  }
}

describe('NoteController', () => {
  let controller: NoteController;
  let repository: InMemoryNoteRepository;

  beforeEach(async () => {
    repository = new InMemoryNoteRepository();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [
        NoteService,
        { provide: NoteRepository, useValue: repository },
      ],
    }).compile();
    controller = module.get(NoteController);
  });

  it('creates a note and returns it serialized', async () => {
    const result = await controller.create({ title: 'Hi', content: 'Body' });

    expect(result).toEqual(
      expect.objectContaining({ title: 'Hi', content: 'Body' }),
    );
    expect(result.id).toEqual(expect.any(String));
    expect(result.createdAt).toEqual(expect.any(String));
  });

  it('lists every persisted note', async () => {
    await controller.create({ title: 'a', content: 'a' });
    await controller.create({ title: 'b', content: 'b' });

    expect(await controller.list()).toHaveLength(2);
  });

  it('updates an existing note', async () => {
    const created = await controller.create({ title: 'old', content: 'old' });

    const updated = await controller.update(created.id, {
      title: 'new',
      content: 'new',
    });

    expect(updated.title).toBe('new');
    expect(updated.content).toBe('new');
  });

  it('deletes an existing note', async () => {
    const created = await controller.create({ title: 'x', content: 'x' });

    await controller.remove(created.id);

    expect(await controller.list()).toHaveLength(0);
  });

  it('throws NotFoundException for an unknown id on get', async () => {
    await expect(controller.getById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
