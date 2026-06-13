export function shellEscape(value: string): string {
  if (value.length === 0) {
    return "''";
  }

  return `'${value.replaceAll("'", `'"'"'`)}'`;
}
