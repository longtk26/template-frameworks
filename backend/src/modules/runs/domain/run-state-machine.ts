import { AgentRole, RunStatus } from '../../shared/domain/types';

/** Statuses where the orchestrator has an agent role (or the fix loop) to run. Every other
 * status is either waiting for a human (`awaiting_*`) or terminal. */
export const ACTIVE_STATUSES: RunStatus[] = [
  'researching',
  'designing',
  'building_frontend',
  'building_backend',
  'testing',
  'reviewing',
  'fixing',
];

export const ROLE_FOR_STATUS: Partial<Record<RunStatus, AgentRole>> = {
  researching: 'researcher',
  designing: 'designer',
  building_frontend: 'frontend',
  building_backend: 'backend',
  testing: 'tester',
  reviewing: 'reviewer',
};

/** Roles re-run (as fresh attempts) each time the automated or human-requested fix loop
 * triggers `fixing` — deliberately not just "backend", since a review comment or a human's
 * requested change may need frontend and/or test updates too. */
export const FIX_LOOP_ROLES: AgentRole[] = ['frontend', 'backend', 'tester'];

export function isActiveStatus(status: RunStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export type RunStateMachineInput = {
  status: RunStatus;
  isNewFeature: boolean;
  fixIterationCount: number;
  maxFixIterations: number;
  /** Only meaningful when `status === 'reviewing'` — did the Reviewer flag blocking issues? */
  reviewerFoundBlockingIssues?: boolean;
};

/**
 * Pure function computing the next `run_status` given the current run state — see the
 * transition table in the plan. Kept side-effect free and dependency-free so it's trivial
 * to unit test exhaustively without a database or NestJS TestingModule.
 */
export function computeNextStatus(input: RunStateMachineInput): RunStatus {
  switch (input.status) {
    case 'pending':
      return input.isNewFeature ? 'researching' : 'designing';
    case 'researching':
      return 'awaiting_plan_review';
    case 'designing':
      return 'building_frontend';
    case 'building_frontend':
      return 'building_backend';
    case 'building_backend':
      return 'testing';
    case 'testing':
      return 'reviewing';
    case 'reviewing':
      if (
        input.reviewerFoundBlockingIssues &&
        input.fixIterationCount < input.maxFixIterations
      ) {
        return 'fixing';
      }
      return 'awaiting_code_review';
    case 'fixing':
      return 'reviewing';
    default:
      // awaiting_plan_review / awaiting_code_review / completed / failed / cancelled are
      // never advanced automatically — a human decision or terminal state ends the chain.
      return input.status;
  }
}
