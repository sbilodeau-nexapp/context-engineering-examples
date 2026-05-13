import { faker } from '@faker-js/faker';
import * as dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import { SimpleExample } from './SimpleExample';

export const SimpleExampleFixture = {
  create: (
    attributes: Partial<ConstructorParameters<typeof SimpleExample>[0]> = {},
  ) =>
    new SimpleExample({
      id: uuid(),
      name: faker.commerce.department(),
      date: dayjs().toDate(),
      comment: faker.lorem.paragraph(),
      IsABool: true,
      ...attributes,
    }),
};
