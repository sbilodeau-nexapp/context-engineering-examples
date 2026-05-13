import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import type { Note } from './domain/Note';
import { NoteService } from './note.service';

interface NoteResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotePayload {
  title: string;
  content: string;
}

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}
  @Get()
  async list(): Promise<NoteResponse[]> {
    const notes = await this.noteService.list();
    return notes.map(serialize);
  }
  @Get(':id')
  async getById(@Param('id') id: string): Promise<NoteResponse> {
    return serialize(await this.noteService.getById(id));
  }
  @Post()
  async create(@Body() body: NotePayload): Promise<NoteResponse> {
    return serialize(await this.noteService.create(body));
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: NotePayload,
  ): Promise<NoteResponse> {
    return serialize(await this.noteService.update(id, body));
  }
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.noteService.remove(id);
  }
}

const serialize = (note: Note): NoteResponse => ({
  id: note.id,
  title: note.title,
  content: note.content,
  createdAt: note.createdAt.toISOString(),
  updatedAt: note.updatedAt.toISOString(),
});
