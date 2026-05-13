import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma.service';
import { Note } from '../domain/Note';
import type { NoteRepository } from '../domain/note.repository';

@Injectable()
export class NotePrismaRepository implements NoteRepository {
  constructor(private readonly prismaService: PrismaService) {}
  public async getAllNotes() {
    return (
      await this.prismaService.note.findMany({
        orderBy: { created_at: 'desc' },
      })
    ).map(NoteAssembler.fromDto);
  }
  public async getNoteById(id: string) {
    const dto = await this.prismaService.note.findUnique({ where: { id } });
    return dto ? NoteAssembler.fromDto(dto) : null;
  }
  public async createNote(note: Note) {
    await this.prismaService.note.create({
      data: {
        id: note.id,
        title: note.title,
        content: note.content,
        created_at: note.createdAt,
        updated_at: note.updatedAt,
      },
    });
  }
  public async updateNote(
    id: string,
    title: string,
    content: string,
    updatedAt: Date,
  ) {
    await this.prismaService.note.update({
      where: { id },
      data: { title, content, updated_at: updatedAt },
    });
  }
  public async deleteNote(id: string) {
    await this.prismaService.note.delete({ where: { id } });
  }
}

const NoteDto = Prisma.validator<Prisma.noteDefaultArgs>()({});

export type NoteDto = Prisma.noteGetPayload<typeof NoteDto>;

const NoteAssembler = {
  fromDto: (dto: NoteDto) =>
    new Note({
      id: dto.id,
      title: dto.title,
      content: dto.content,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }),
};
