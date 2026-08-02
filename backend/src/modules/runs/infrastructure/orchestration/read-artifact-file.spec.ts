import { reviewReportHasBlockingIssues } from './read-artifact-file';

describe('reviewReportHasBlockingIssues', () => {
  it('detects the BLOCKING sentinel on the first line', () => {
    expect(reviewReportHasBlockingIssues('STATUS: BLOCKING\n\nFix the null check.')).toBe(true);
  });

  it('returns false for the READY sentinel', () => {
    expect(reviewReportHasBlockingIssues('STATUS: READY\n\nLooks good.')).toBe(false);
  });

  it('returns false when the sentinel is missing entirely', () => {
    expect(reviewReportHasBlockingIssues('Just some free-form notes.')).toBe(false);
  });

  it('matches the sentinel on any line, not only the first', () => {
    expect(reviewReportHasBlockingIssues('# Review\nSTATUS: BLOCKING\nDetails...')).toBe(true);
  });
});
