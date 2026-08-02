import { Injectable } from '@nestjs/common';
import { env } from './env';

@Injectable()
export class EnvService {
  readonly appName = env.APP_NAME;
  readonly port = env.PORT;
  readonly dbUrl = env.DB_URL;
  readonly gitWorkspacesDir = env.GIT_WORKSPACES_DIR;
  readonly corsOrigin = env.CORS_ORIGIN;
  readonly agentRunnerMode = env.AGENT_RUNNER_MODE;
  readonly templateFrameworksRepoUrl = env.TEMPLATE_FRAMEWORKS_REPO_URL;
}
