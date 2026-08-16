import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global so any module can inject PrismaService without re-importing this module.
 * Data access is a genuine cross-cutting concern, which is what @Global is for.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
