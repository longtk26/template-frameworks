export class ProjectResponseDto {
  id: string;
  name: string;
  description: string | null;
  repoUrl: string;
  defaultBranch: string;
  backendFramework: string;
  frontendFramework: string;
  bootstrapFromTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
