import nock from 'nock';
import { byRole, byText } from 'testing-library-selector';

import { TEST_BASE_URL } from '@/common/tests/TestBaseUrl';
import { render, t, userEvent } from '@/common/tests/TestWrapper';
import { Note } from '@/notes/api/types/Note';
import Notes from '@/notes/Notes';

const buildNote = (overrides: Partial<Note> = {}): Note => ({
  id: '11111111-1111-1111-1111-111111111111',
  title: 'My note',
  content: 'Hello body',
  createdAt: '2026-05-13T00:00:00.000Z',
  updatedAt: '2026-05-13T00:00:00.000Z',
  ...overrides,
});

const ui = {
  empty: byText(t('notesEmpty')),
  titleInput: byRole('textbox', { name: t('notesTitlePlaceholder') }),
  contentInput: byRole('textbox', { name: t('notesContentPlaceholder') }),
  createButton: byRole('button', { name: t('notesActionCreate') }),
  deleteButton: byRole('button', { name: t('notesActionDelete') }),
};

describe('Notes page', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('shows the empty state when there are no notes', async () => {
    nock(TEST_BASE_URL).get('/notes').reply(200, []);

    render(<Notes />);

    expect(await ui.empty.find()).toBeInTheDocument();
  });

  it('renders existing notes', async () => {
    const note = buildNote({ title: 'Existing', content: 'Persisted body' });
    nock(TEST_BASE_URL).get('/notes').reply(200, [note]);

    render(<Notes />);

    expect(await byText('Existing').find()).toBeInTheDocument();
    expect(byText('Persisted body').get()).toBeInTheDocument();
  });

  it('creates a note via the form and refetches the list', async () => {
    nock(TEST_BASE_URL).get('/notes').reply(200, []);
    const created = buildNote({ title: 'Fresh', content: 'Brand new' });
    nock(TEST_BASE_URL)
      .post('/notes', { title: 'Fresh', content: 'Brand new' })
      .reply(201, created);
    nock(TEST_BASE_URL).get('/notes').reply(200, [created]);

    render(<Notes />);
    await ui.empty.find();

    const user = userEvent.setup();
    await user.type(ui.titleInput.get(), 'Fresh');
    await user.type(ui.contentInput.get(), 'Brand new');
    await user.click(ui.createButton.get());

    expect(await byText('Fresh').find()).toBeInTheDocument();
  });

  it('deletes a note', async () => {
    const note = buildNote({ title: 'Doomed', content: 'Bye' });
    nock(TEST_BASE_URL).get('/notes').reply(200, [note]);
    nock(TEST_BASE_URL).delete(`/notes/${note.id}`).reply(204);
    nock(TEST_BASE_URL).get('/notes').reply(200, []);

    render(<Notes />);
    await byText('Doomed').find();

    const user = userEvent.setup();
    await user.click(ui.deleteButton.get());

    expect(await ui.empty.find()).toBeInTheDocument();
  });
});
