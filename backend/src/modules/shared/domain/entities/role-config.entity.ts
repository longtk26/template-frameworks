import { AgentRole, McpServerConfig } from '../types';

export class RoleConfigEntity {
  id?: string;
  projectId: string | null;
  role: AgentRole;
  model: string;
  systemPromptTemplate: string;
  allowedTools: string[];
  mcpServers: McpServerConfig[];
  skills: string[];
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: {
    id?: string;
    projectId?: string | null;
    role: AgentRole;
    model?: string;
    systemPromptTemplate: string;
    allowedTools?: string[];
    mcpServers?: McpServerConfig[];
    skills?: string[];
    enabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.projectId = props.projectId ?? null;
    this.role = props.role;
    this.model = props.model ?? 'claude-sonnet-5';
    this.systemPromptTemplate = props.systemPromptTemplate;
    this.allowedTools = props.allowedTools ?? [];
    this.mcpServers = props.mcpServers ?? [];
    this.skills = props.skills ?? [];
    this.enabled = props.enabled ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
