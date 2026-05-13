import { Test } from '@nestjs/testing';

import { PrismaService } from '../../../prisma.service';
import { NoteRepository } from '../../domain/note.repository';
import { NoteFixture } from '../../domain/NoteFixture';
import { NotePrismaRepository } from '../note.prisma.repository';

describe('NotePrismaRepository', () => {
  const init = async () =>
    Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: jestPrisma.client },
        { provide: NoteRepository, useClass: NotePrismaRepository },
      ],
    }).compile();

  it('returns every persisted note when listing', async () => {
    const module = await init();
    const repository = module.get(NoteRepository);
    const noteA = NoteFixture.create();
    const noteB = NoteFixture.create();

    await repository.createNote(noteA);
    await repository.createNote(noteB);

    const result = await repository.getAllNotes();

    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([noteA, noteB]));
  });

  it('returns a single note by id', async () => {
    const module = await init();
    const repository = module.get(NoteRepository);
    const note = NoteFixture.create();
    await repository.createNote(note);

    const result = await repository.getNoteById(note.id);

    expect(result).toEqual(note);
  });

  it('returns null when fetching an unknown id', async () => {
    const module = await init();
    const repository = module.get(NoteRepository);

    const result = await repository.getNoteById(
      '00000000-0000-0000-0000-000000000000',
    );

    expect(result).toBeNull();
  });

  it('updates an existing note', async () => {
    const module = await init();
    const repository = module.get(NoteRepository);
    const note = NoteFixture.create();
    await repository.createNote(note);
    const newUpdatedAt = new Date(note.updatedAt.getTime() + 1000);

    await repository.updateNote(
      note.id,
      'new title',
      'new content',
      newUpdatedAt,
    );

    const result = await repository.getNoteById(note.id);
    expect(result).toEqual(
      expect.objectContaining({
        id: note.id,
        title: 'new title',
        content: 'new content',
        updatedAt: newUpdatedAt,
      }),
    );
  });

  it('deletes a note', async () => {
    const module = await init();
    const repository = module.get(NoteRepository);
    const note = NoteFixture.create();
    await repository.createNote(note);

    await repository.deleteNote(note.id);

    expect(await repository.getNoteById(note.id)).toBeNull();
  });
});
