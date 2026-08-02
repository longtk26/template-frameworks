export class ProjectEntity {
  id?: string;
  name: string;
  description: string | null;
  repoUrl: string;
  defaultBranch: string;
  mirrorPath: string | null;
  backendFramework: string;
  frontendFramework: string;
  bootstrapFromTemplate: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: {
    id?: string;
    name: string;
    description?: string | null;
    repoUrl: string;
    defaultBranch?: string;
    mirrorPath?: string | null;
    backendFramework?: string;
    frontendFramework?: string;
    bootstrapFromTemplate?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description ?? null;
    this.repoUrl = props.repoUrl;
    this.defaultBranch = props.defaultBranch ?? 'main';
    this.mirrorPath = props.mirrorPath ?? null;
    this.backendFramework = props.backendFramework ?? 'nestjs';
    this.frontendFramework = props.frontendFramework ?? 'react-router';
    this.bootstrapFromTemplate = props.bootstrapFromTemplate ?? false;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
