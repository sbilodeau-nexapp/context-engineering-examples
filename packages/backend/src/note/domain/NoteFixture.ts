import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';

import { Note } from './Note';

export const NoteFixture = {
  create: (attributes: Partial<ConstructorParameters<typeof Note>[0]> = {}) => {
    const now = new Date();
    return new Note({
      id: uuid(),
      title: faker.lorem.sentence(3),
      content: faker.lorem.paragraph(),
      createdAt: now,
      updatedAt: now,
      ...attributes,
    });
  },
};
