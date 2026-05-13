import { Test } from '@nestjs/testing';

import { PrismaService } from '../../../prisma.service';
import { SimpleExampleRepository } from '../../domain/example.repository';
import { SimpleExampleFixture } from '../../domain/SimpleExampleFixture';
import { SimpleExamplePrismaRepository } from '../example.prisma.repository';

describe('ImportantDatesPrismaRepository', () => {
  const init = async () =>
    Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: jestPrisma.client },
        {
          provide: SimpleExampleRepository,
          useClass: SimpleExamplePrismaRepository,
        },
      ],
    }).compile();

  it('when getting all simple examples, should retrieve them', async () => {
    const module = await init();
    const repository = module.get(SimpleExampleRepository);
    const simpleExample = SimpleExampleFixture.create();
    const simpleExample2 = SimpleExampleFixture.create();

    await repository.createSimpleExample(
      simpleExample.id,
      simpleExample.name,
      simpleExample.date,
      simpleExample.IsABool,
      simpleExample.comment,
    );
    await repository.createSimpleExample(
      simpleExample2.id,
      simpleExample2.name,
      simpleExample2.date,
      simpleExample2.IsABool,
      simpleExample2.comment,
    );

    const result = await repository.getAllSimpleExamples();

    const expected = [simpleExample, simpleExample2];
    expect(result).toEqual(expected);
  });
});
