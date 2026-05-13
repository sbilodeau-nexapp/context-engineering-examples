import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import type { Circus } from '@jest/types';
import { PrismaEnvironmentDelegate } from '@quramy/jest-prisma-core';
import Environment from 'jest-environment-node';

// eslint-disable-next-line import/no-default-export
export default class PrismaEnvironment extends Environment {
  private readonly delegate: PrismaEnvironmentDelegate;
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.delegate = new PrismaEnvironmentDelegate(config, context);
  }
  async setup() {
    const jestPrisma = await this.delegate.preSetup();
    await super.setup();
    this.global.jestPrisma = jestPrisma;
    this.global.Date = Date;
  }
  handleTestEvent(event: Circus.Event) {
    return this.delegate.handleTestEvent(event);
  }
  async teardown() {
    await Promise.all([super.teardown(), this.delegate.teardown()]);
  }
}
