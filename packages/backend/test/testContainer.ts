import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';

export class TestContainer {
  private static container: StartedPostgreSqlContainer;
  static async init() {
    this.container = await new PostgreSqlContainer().start();
    const url =
      `postgresql://${this.container.getUsername()}:${this.container.getPassword()}` +
      `@${this.container.getHost()}:${this.container.getPort()}/${this.container.getDatabase()}?schema=public`;
    process.env.DATABASE_URL = url;

    execSync(`DATABASE_URL=${url} npx prisma migrate deploy`);
  }
  static async stop() {
    await this.container.stop();
  }
}
