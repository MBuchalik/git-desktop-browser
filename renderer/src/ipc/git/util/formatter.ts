type FormatterObject = Record<string, string>;
type FormatResult<T extends FormatterObject> = { [Key in keyof T]: string };
interface Formatter<T extends FormatterObject> {
  formatParams: string[];
  format: (stdout: string) => Array<FormatResult<T>>;
}
export function createFormatter<T extends FormatterObject>(
  formatterObject: T,
): Formatter<T> {
  const formatString = Object.values(formatterObject).join('%x00');

  const format: Formatter<T>['format'] = (stdout) => {
    const result: Array<FormatResult<T>> = [];

    const splitStdout = stdout.split('\0');
    const itemsPerLine = Object.values(formatterObject).length;

    for (
      let lineStart = 0;
      lineStart < splitStdout.length;
      lineStart += itemsPerLine
    ) {
      const line = splitStdout.slice(lineStart, lineStart + itemsPerLine);
      if (line.length < itemsPerLine) {
        continue;
      }

      const resultItem: Record<string, string> = {};
      const keys = Object.keys(formatterObject);
      for (let keyIndex = 0; keyIndex < itemsPerLine; keyIndex++) {
        const theKey = keys[keyIndex];
        const theValue = line[keyIndex];
        if (theKey === undefined || theValue === undefined) {
          console.error(
            'The key or the value is undefined. This should not happen.',
            keys,
            line,
          );
          continue;
        }

        resultItem[theKey] = theValue;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      result.push(resultItem as any);
    }

    return result;
  };

  return {
    formatParams: ['-z', `--format=${formatString}`],
    format: format,
  };
}
