import { v4 as uuid } from 'uuid';

import { SimpleExample } from './SimpleExample';

export const ImportantDateFactory = {
  create: (
    attributes: Omit<ConstructorParameters<typeof SimpleExample>[0], 'id'>,
  ) => new SimpleExample({ id: uuid(), ...attributes }),
};
