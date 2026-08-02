import { ArtifactType } from '../types';

export class ArtifactEntity {
  id?: string;
  runId: string;
  stepId: string | null;
  type: ArtifactType;
  title: string;
  content: string;
  filePath: string | null;
  createdAt?: Date;

  constructor(props: {
    id?: string;
    runId: string;
    stepId?: string | null;
    type: ArtifactType;
    title: string;
    content: string;
    filePath?: string | null;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.runId = props.runId;
    this.stepId = props.stepId ?? null;
    this.type = props.type;
    this.title = props.title;
    this.content = props.content;
    this.filePath = props.filePath ?? null;
    this.createdAt = props.createdAt;
  }
}
