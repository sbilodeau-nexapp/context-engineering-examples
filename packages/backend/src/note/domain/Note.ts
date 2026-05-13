interface Attributes {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Note {
  constructor({ id, title, content, createdAt, updatedAt }: Attributes) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
