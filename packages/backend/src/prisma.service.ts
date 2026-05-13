import type { OnModuleInit } from '@nestjs/common';
import { Global, Injectable, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
export enum PrismaErrorCodes {
  'UNIQUE_CONSTRAINT_FAILED' = 'P2002',
}
