import { computeNextStatus, isActiveStatus } from './run-state-machine';
import { RunStatus } from '../../shared/domain/types';

function withDefaults(overrides: Partial<Parameters<typeof computeNextStatus>[0]>) {
  return computeNextStatus({
    status: 'pending',
    isNewFeature: false,
    fixIterationCount: 0,
    maxFixIterations: 3,
    ...overrides,
  });
}

describe('computeNextStatus', () => {
  it('pending -> researching when isNewFeature is true', () => {
    expect(withDefaults({ status: 'pending', isNewFeature: true })).toBe('researching');
  });

  it('pending -> designing when isNewFeature is false', () => {
    expect(withDefaults({ status: 'pending', isNewFeature: false })).toBe('designing');
  });

  it('researching -> awaiting_plan_review', () => {
    expect(withDefaults({ status: 'researching' })).toBe('awaiting_plan_review');
  });

  it.each<[RunStatus, RunStatus]>([
    ['designing', 'building_frontend'],
    ['building_frontend', 'building_backend'],
    ['building_backend', 'testing'],
    ['testing', 'reviewing'],
  ])('%s -> %s', (status, expected) => {
    expect(withDefaults({ status })).toBe(expected);
  });

  it('reviewing -> awaiting_code_review when no blocking issues', () => {
    expect(
      withDefaults({ status: 'reviewing', reviewerFoundBlockingIssues: false }),
    ).toBe('awaiting_code_review');
  });

  it('reviewing -> fixing when blocking issues found and iterations remain', () => {
    expect(
      withDefaults({
        status: 'reviewing',
        reviewerFoundBlockingIssues: true,
        fixIterationCount: 0,
        maxFixIterations: 3,
      }),
    ).toBe('fixing');
  });

  it('reviewing -> awaiting_code_review when blocking issues found but max iterations reached', () => {
    expect(
      withDefaults({
        status: 'reviewing',
        reviewerFoundBlockingIssues: true,
        fixIterationCount: 3,
        maxFixIterations: 3,
      }),
    ).toBe('awaiting_code_review');
  });

  it('fixing -> reviewing unconditionally', () => {
    expect(withDefaults({ status: 'fixing', fixIterationCount: 99 })).toBe('reviewing');
  });

  it.each<RunStatus>([
    'awaiting_plan_review',
    'awaiting_code_review',
    'completed',
    'failed',
    'cancelled',
  ])('%s is left unchanged (requires a human decision or is terminal)', (status) => {
    expect(withDefaults({ status })).toBe(status);
  });
});

describe('isActiveStatus', () => {
  it.each<RunStatus>([
    'researching',
    'designing',
    'building_frontend',
    'building_backend',
    'testing',
    'reviewing',
    'fixing',
  ])('%s is active', (status) => {
    expect(isActiveStatus(status)).toBe(true);
  });

  it.each<RunStatus>([
    'pending',
    'awaiting_plan_review',
    'awaiting_code_review',
    'completed',
    'failed',
    'cancelled',
  ])('%s is not active', (status) => {
    expect(isActiveStatus(status)).toBe(false);
  });
});
