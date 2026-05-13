import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma.service';
import type { SimpleExampleRepository } from '../domain/example.repository';
import { SimpleExample } from '../domain/SimpleExample';

@Injectable()
export class SimpleExamplePrismaRepository implements SimpleExampleRepository {
  constructor(private readonly prismaService: PrismaService) {}
  public async getAllSimpleExamples() {
    return (await this.prismaService.simple_example.findMany()).map(
      SimpleExampleAssembler.fromDto,
    );
  }
  public async createSimpleExample(
    id: string,
    name: string,
    date: Date,
    IsABool: boolean,
    comment?: string | null,
  ) {
    await this.prismaService.simple_example.create({
      data: {
        id,
        name,
        date,
        is_a_bool: IsABool,
        comment,
      },
    });
  }
}
const SimpleExampleDto = Prisma.validator<Prisma.simple_exampleDefaultArgs>()(
  {},
);

export type SimpleExampleDto = Prisma.simple_exampleGetPayload<
  typeof SimpleExampleDto
>;

const SimpleExampleAssembler = {
  fromDto: (dto: SimpleExampleDto) =>
    new SimpleExample({
      id: dto.id,
      name: dto.name,
      date: dto.date,
      IsABool: dto.is_a_bool,
      comment: dto.comment,
    }),
};
