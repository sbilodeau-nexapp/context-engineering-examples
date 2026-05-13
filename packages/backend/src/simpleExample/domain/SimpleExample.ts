interface Attributes {
  id: string;
  name: string;
  date: Date;
  comment?: string | null;
  IsABool: boolean;
}

export class SimpleExample {
  constructor({ id, name, date, comment, IsABool }: Attributes) {
    this.id = id;
    this.name = name;
    this.date = date;
    this.comment = comment;
    this.IsABool = IsABool;
  }
  id: string;
  name: string;
  date: Date;
  comment?: string | null;
  IsABool: boolean;
}
