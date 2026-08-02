import { NotificationType } from '../types';

export class NotificationEntity {
  id?: string;
  runId: string | null;
  stepId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt?: Date;

  constructor(props: {
    id?: string;
    runId?: string | null;
    stepId?: string | null;
    type: NotificationType;
    title: string;
    body: string;
    readAt?: Date | null;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.runId = props.runId ?? null;
    this.stepId = props.stepId ?? null;
    this.type = props.type;
    this.title = props.title;
    this.body = props.body;
    this.readAt = props.readAt ?? null;
    this.createdAt = props.createdAt;
  }
}
