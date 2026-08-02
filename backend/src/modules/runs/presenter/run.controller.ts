import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateRunUsecase } from '../usecases/create-run.usecase';
import { ApprovePlanReviewUsecase } from '../usecases/approve-plan-review.usecase';
import { RequestPlanChangesUsecase } from '../usecases/request-plan-changes.usecase';
import { ApproveCodeReviewUsecase } from '../usecases/approve-code-review.usecase';
import { RequestCodeChangesUsecase } from '../usecases/request-code-changes.usecase';
import { GetRunUsecase } from '../usecases/get-run.usecase';
import { ListRunsUsecase } from '../usecases/list-runs.usecase';
import { ListRunStepsUsecase } from '../usecases/list-run-steps.usecase';
import { GetStepEventsUsecase } from '../usecases/get-step-events.usecase';
import { GetRunDiffUsecase } from '../usecases/get-run-diff.usecase';
import { CancelRunUsecase } from '../usecases/cancel-run.usecase';
import { ListArtifactsUsecase } from '../usecases/list-artifacts.usecase';
import { ListReviewCheckpointsUsecase } from '../usecases/list-review-checkpoints.usecase';
import { CreateRunRequestDto } from './dtos/create-run.dto';
import { DecideReviewRequestDto } from './dtos/decide-review.dto';

@ApiTags('runs')
@Controller()
export class RunController {
  constructor(
    private readonly createRunUsecase: CreateRunUsecase,
    private readonly approvePlanReviewUsecase: ApprovePlanReviewUsecase,
    private readonly requestPlanChangesUsecase: RequestPlanChangesUsecase,
    private readonly approveCodeReviewUsecase: ApproveCodeReviewUsecase,
    private readonly requestCodeChangesUsecase: RequestCodeChangesUsecase,
    private readonly getRunUsecase: GetRunUsecase,
    private readonly listRunsUsecase: ListRunsUsecase,
    private readonly listRunStepsUsecase: ListRunStepsUsecase,
    private readonly getStepEventsUsecase: GetStepEventsUsecase,
    private readonly getRunDiffUsecase: GetRunDiffUsecase,
    private readonly cancelRunUsecase: CancelRunUsecase,
    private readonly listArtifactsUsecase: ListArtifactsUsecase,
    private readonly listReviewCheckpointsUsecase: ListReviewCheckpointsUsecase,
  ) {}

  @Post('runs')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRunRequestDto) {
    return this.createRunUsecase.execute(dto);
  }

  @Get('runs')
  list(@Query('projectId') projectId: string) {
    return this.listRunsUsecase.execute(projectId);
  }

  @Get('runs/:id')
  get(@Param('id') id: string) {
    return this.getRunUsecase.execute(id);
  }

  @Post('runs/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.cancelRunUsecase.execute(id);
  }

  @Get('runs/:id/steps')
  listSteps(@Param('id') id: string) {
    return this.listRunStepsUsecase.execute(id);
  }

  @Get('runs/:id/steps/:stepId/events')
  getStepEvents(@Param('stepId') stepId: string) {
    return this.getStepEventsUsecase.execute(stepId);
  }

  @Get('runs/:id/artifacts')
  listArtifacts(@Param('id') id: string) {
    return this.listArtifactsUsecase.execute(id);
  }

  @Get('runs/:id/review-checkpoints')
  listReviewCheckpoints(@Param('id') id: string) {
    return this.listReviewCheckpointsUsecase.execute(id);
  }

  @Get('runs/:id/diff')
  getDiff(@Param('id') id: string) {
    return this.getRunDiffUsecase.execute(id);
  }

  @Post('runs/:id/plan-review/approve')
  approvePlanReview(@Param('id') id: string) {
    return this.approvePlanReviewUsecase.execute(id);
  }

  @Post('runs/:id/plan-review/request-changes')
  requestPlanChanges(@Param('id') id: string, @Body() dto: DecideReviewRequestDto) {
    return this.requestPlanChangesUsecase.execute(id, dto);
  }

  @Post('runs/:id/code-review/approve')
  approveCodeReview(@Param('id') id: string) {
    return this.approveCodeReviewUsecase.execute(id);
  }

  @Post('runs/:id/code-review/request-changes')
  requestCodeChanges(@Param('id') id: string, @Body() dto: DecideReviewRequestDto) {
    return this.requestCodeChangesUsecase.execute(id, dto);
  }
}
