import { renderTemplate } from '../../../../libs/prompt/render-template';
import { PipelineRunEntity } from '../../../shared/domain/entities/pipeline-run.entity';
import { ProjectEntity } from '../../../shared/domain/entities/project.entity';
import { RoleConfigEntity } from '../../../shared/domain/entities/role-config.entity';

export function buildSystemPrompt(params: {
  roleConfig: RoleConfigEntity;
  run: PipelineRunEntity;
  project: ProjectEntity;
  planMd?: string;
  designMd?: string;
}): string {
  return renderTemplate(params.roleConfig.systemPromptTemplate, {
    projectName: params.project.name,
    requestDescription: params.run.requestDescription,
    planMd: params.planMd ?? '(none)',
    designMd: params.designMd ?? '(none)',
  });
}
