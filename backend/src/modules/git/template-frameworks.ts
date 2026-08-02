/**
 * longtk26/template-frameworks is the user's own published version of this very
 * backend/templates monorepo — pushed as branches instead of folders (verified via
 * `git ls-remote`: feat/nestjs-templates, feat/fastapi, feat/go-gin, feat/react-router).
 * These map a project's `backendFramework`/`frontendFramework` value to the branch to
 * bootstrap a brand-new project's `backend/`/`frontend/` subfolder from.
 */
export const TEMPLATE_BRANCH_FOR_BACKEND_FRAMEWORK: Record<string, string> = {
  nestjs: 'feat/nestjs-templates',
  fastapi: 'feat/fastapi',
  go: 'feat/go-gin',
};

export const TEMPLATE_BRANCH_FOR_FRONTEND_FRAMEWORK: Record<string, string> = {
  'react-router': 'feat/react-router',
};

export function resolveBackendTemplateBranch(backendFramework: string): string | null {
  return TEMPLATE_BRANCH_FOR_BACKEND_FRAMEWORK[backendFramework] ?? null;
}

export function resolveFrontendTemplateBranch(frontendFramework: string): string | null {
  return TEMPLATE_BRANCH_FOR_FRONTEND_FRAMEWORK[frontendFramework] ?? null;
}
