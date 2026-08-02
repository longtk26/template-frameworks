import { Module } from '@nestjs/common';
import { IGitService } from './ports/output/git-service.port';
import { SimpleGitService } from './infrastructure/simple-git.service';

@Module({
  providers: [{ provide: IGitService, useClass: SimpleGitService }],
  exports: [IGitService],
})
export class GitModule {}
