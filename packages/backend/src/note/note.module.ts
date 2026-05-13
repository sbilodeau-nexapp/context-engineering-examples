import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma.service';
import { NoteRepository } from './domain/note.repository';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NotePrismaRepository } from './repository/note.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [NoteController],
  providers: [
    NoteService,
    { provide: NoteRepository, useClass: NotePrismaRepository },
  ],
})
export class NoteModule {}
