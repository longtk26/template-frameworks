/** Replaces `{{key}}` tokens in `template` with `vars[key]`, leaving unknown tokens untouched. */
export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match,
  );
}
