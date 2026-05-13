import nock from 'nock';

import { TEST_BASE_URL } from '@/common/tests/TestBaseUrl';
import { NotesClient } from '@/notes/api/NotesClient';
import { Note } from '@/notes/api/types/Note';

const sampleNote: Note = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'a title',
  content: 'a body',
  createdAt: '2026-05-13T00:00:00.000Z',
  updatedAt: '2026-05-13T00:00:00.000Z',
};

describe('NotesClient', () => {
  it('lists notes', async () => {
    nock(TEST_BASE_URL).get('/notes').reply(200, [sampleNote]);

    expect(await NotesClient.list()).toEqual([sampleNote]);
  });

  it('creates a note', async () => {
    nock(TEST_BASE_URL)
      .post('/notes', { title: 'a title', content: 'a body' })
      .reply(201, sampleNote);

    expect(
      await NotesClient.create({ title: 'a title', content: 'a body' }),
    ).toEqual(sampleNote);
  });

  it('updates a note', async () => {
    const updated = { ...sampleNote, title: 'new' };
    nock(TEST_BASE_URL)
      .put(`/notes/${sampleNote.id}`, { title: 'new', content: 'a body' })
      .reply(200, updated);

    expect(
      await NotesClient.update(sampleNote.id, {
        title: 'new',
        content: 'a body',
      }),
    ).toEqual(updated);
  });

  it('deletes a note', async () => {
    nock(TEST_BASE_URL).delete(`/notes/${sampleNote.id}`).reply(204);

    await expect(NotesClient.remove(sampleNote.id)).resolves.toBeUndefined();
  });
});
