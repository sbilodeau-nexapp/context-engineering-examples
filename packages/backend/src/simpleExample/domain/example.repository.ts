import type { SimpleExample } from './SimpleExample';

export abstract class SimpleExampleRepository {
  public abstract getAllSimpleExamples(): Promise<SimpleExample[]>;
  public abstract createSimpleExample(
    id: string,
    name: string,
    date: Date,
    IsABool: boolean,
    comment?: string | null,
  ): Promise<void>;
}
