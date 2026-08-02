import { AgentRole, StepStatus } from '../types';

export class RunStepEntity {
  id?: string;
  runId: string;
  role: AgentRole;
  attemptNumber: number;
  sequenceIndex: number;
  status: StepStatus;
  claudeSessionId: string | null;
  summary: string | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt?: Date;

  constructor(props: {
    id?: string;
    runId: string;
    role: AgentRole;
    attemptNumber?: number;
    sequenceIndex: number;
    status?: StepStatus;
    claudeSessionId?: string | null;
    summary?: string | null;
    errorMessage?: string | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.runId = props.runId;
    this.role = props.role;
    this.attemptNumber = props.attemptNumber ?? 1;
    this.sequenceIndex = props.sequenceIndex;
    this.status = props.status ?? 'pending';
    this.claudeSessionId = props.claudeSessionId ?? null;
    this.summary = props.summary ?? null;
    this.errorMessage = props.errorMessage ?? null;
    this.startedAt = props.startedAt ?? null;
    this.completedAt = props.completedAt ?? null;
    this.createdAt = props.createdAt;
  }
}
