import { StepEventEntity } from '../../../shared/domain/entities/step-event.entity';

export abstract class IStepEventRepository {
  abstract create(event: StepEventEntity): Promise<StepEventEntity>;
  abstract findByStep(stepId: string): Promise<StepEventEntity[]>;
}
