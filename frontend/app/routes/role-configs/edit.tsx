import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "~/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { roleConfigQueries } from "~/lib/queries";
import { roleConfigMutations } from "~/lib/mutations";
import type { McpServerConfig, RoleConfig } from "~/lib/queries";

export function meta() {
  return [{ title: "Role configs — Agent Orchestrator" }];
}

const ROLE_LABEL: Record<string, string> = {
  researcher: "Researcher",
  designer: "Designer",
  frontend: "Frontend",
  backend: "Backend",
  tester: "Tester",
  reviewer: "Reviewer",
};

export default function RoleConfigsEdit() {
  const { data: roleConfigs, isPending } = useQuery(roleConfigQueries.list());

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Role configs</h1>
        <p className="text-sm text-muted-foreground">
          Global defaults for each agent role's model, system prompt, tools, MCP servers, and
          skills. Changes apply to every project unless it has its own override.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        roleConfigs
          ?.slice()
          .sort((a, b) => a.role.localeCompare(b.role))
          .map((config) => <RoleConfigCard key={config.id} config={config} />)
      )}
    </div>
  );
}

function RoleConfigCard({ config }: { config: RoleConfig }) {
  const queryClient = useQueryClient();
  const [model, setModel] = useState(config.model);
  const [systemPromptTemplate, setSystemPromptTemplate] = useState(config.systemPromptTemplate);
  const [allowedTools, setAllowedTools] = useState(config.allowedTools.join(", "));
  const [skills, setSkills] = useState(config.skills.join(", "));
  const [mcpServersText, setMcpServersText] = useState(() =>
    JSON.stringify(config.mcpServers, null, 2),
  );
  const [enabled, setEnabled] = useState(config.enabled);
  const [mcpError, setMcpError] = useState<string | null>(null);

  const update = useMutation({
    ...roleConfigMutations.update(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roleConfigQueries.all().queryKey }),
  });

  useEffect(() => {
    setMcpError(null);
  }, [mcpServersText]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{ROLE_LABEL[config.role] ?? config.role}</CardTitle>
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enabled
        </label>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Model</FieldLabel>
            <Input value={model} onChange={(e) => setModel(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>System prompt template</FieldLabel>
            <Textarea
              rows={8}
              className="font-mono text-xs"
              value={systemPromptTemplate}
              onChange={(e) => setSystemPromptTemplate(e.target.value)}
            />
            <FieldDescription>
              Supports {"{{projectName}}"}, {"{{requestDescription}}"}, {"{{planMd}}"},{" "}
              {"{{designMd}}"} placeholders.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Allowed tools</FieldLabel>
            <Input
              value={allowedTools}
              onChange={(e) => setAllowedTools(e.target.value)}
              placeholder="comma-separated, empty = SDK default"
            />
          </Field>
          <Field>
            <FieldLabel>Skills</FieldLabel>
            <Input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="comma-separated skill names"
            />
          </Field>
          <Field>
            <FieldLabel>MCP servers (JSON)</FieldLabel>
            <Textarea
              rows={4}
              className="font-mono text-xs"
              value={mcpServersText}
              onChange={(e) => setMcpServersText(e.target.value)}
            />
            <FieldDescription>
              Array of {"{ name, enabled, config }"}. {"config: null"} means "let the CLI
              subprocess resolve it from the machine's own MCP config".
            </FieldDescription>
            {mcpError && <p className="text-sm text-destructive">{mcpError}</p>}
          </Field>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                let mcpServers: McpServerConfig[];
                try {
                  mcpServers = JSON.parse(mcpServersText) as McpServerConfig[];
                } catch {
                  setMcpError("MCP servers must be valid JSON");
                  return;
                }
                update.mutate({
                  id: config.id,
                  model,
                  systemPromptTemplate,
                  allowedTools: splitCsv(allowedTools),
                  skills: splitCsv(skills),
                  mcpServers,
                  enabled,
                });
              }}
              disabled={update.isPending}
            >
              {update.isPending ? "Saving…" : "Save"}
            </Button>
            {update.isSuccess && <span className="text-sm text-muted-foreground">Saved.</span>}
            {update.isError && (
              <span className="text-sm text-destructive">
                {update.error instanceof Error ? update.error.message : "Failed to save"}
              </span>
            )}
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
