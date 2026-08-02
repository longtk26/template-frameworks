import { StepEventType } from '../types';

export class StepEventEntity {
  id?: string;
  stepId: string;
  seq: number;
  type: StepEventType;
  payload: Record<string, unknown>;
  createdAt?: Date;

  constructor(props: {
    id?: string;
    stepId: string;
    seq: number;
    type: StepEventType;
    payload: Record<string, unknown>;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.stepId = props.stepId;
    this.seq = props.seq;
    this.type = props.type;
    this.payload = props.payload;
    this.createdAt = props.createdAt;
  }
}
