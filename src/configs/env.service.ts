import { Injectable } from '@nestjs/common';
import { env } from './env';

@Injectable()
export class EnvService {
  readonly appName = env.APP_NAME;
  readonly port = env.PORT;
  readonly dbUrl = env.DB_URL;
}
