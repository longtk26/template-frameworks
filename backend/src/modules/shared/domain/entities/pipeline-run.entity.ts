import { RunStatus } from '../types';

export class PipelineRunEntity {
  id?: string;
  projectId: string;
  title: string;
  requestDescription: string;
  isNewFeature: boolean;
  status: RunStatus;
  branchName: string | null;
  worktreePath: string | null;
  fixIterationCount: number;
  maxFixIterations: number;
  errorMessage: string | null;
  createdAt?: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt?: Date;

  constructor(props: {
    id?: string;
    projectId: string;
    title: string;
    requestDescription: string;
    isNewFeature?: boolean;
    status?: RunStatus;
    branchName?: string | null;
    worktreePath?: string | null;
    fixIterationCount?: number;
    maxFixIterations?: number;
    errorMessage?: string | null;
    createdAt?: Date;
    startedAt?: Date | null;
    completedAt?: Date | null;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title;
    this.requestDescription = props.requestDescription;
    this.isNewFeature = props.isNewFeature ?? false;
    this.status = props.status ?? 'pending';
    this.branchName = props.branchName ?? null;
    this.worktreePath = props.worktreePath ?? null;
    this.fixIterationCount = props.fixIterationCount ?? 0;
    this.maxFixIterations = props.maxFixIterations ?? 3;
    this.errorMessage = props.errorMessage ?? null;
    this.createdAt = props.createdAt;
    this.startedAt = props.startedAt ?? null;
    this.completedAt = props.completedAt ?? null;
    this.updatedAt = props.updatedAt;
  }
}
