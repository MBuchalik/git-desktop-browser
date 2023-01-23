import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { LanguageSupport } from '@codemirror/language';
import { EditorState, Extension } from '@codemirror/state';
import { lineNumbers } from '@codemirror/view';
import { EditorView, minimalSetup } from 'codemirror';
import React from 'react';

interface Props {
  code: string;

  /**
   * The file extension including a dot.
   */
  fileExtension?: string | undefined;
}
export const CodeViewer: React.FC<Props> = (props) => {
  const controller = useController(props);

  return <div ref={controller.containerRef}></div>;
};

interface Controller {
  containerRef: React.RefObject<HTMLDivElement>;
}
function useController(props: Props): Controller {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const extensions: Extension[] = [
      minimalSetup,
      lineNumbers(),
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      EditorView.lineWrapping,
    ];

    if (props.fileExtension !== undefined) {
      const languageSupport = getLanguageSupportForFileExtension(
        props.fileExtension,
      );
      if (languageSupport) {
        extensions.push(languageSupport);
      }
    }

    const view = new EditorView({
      doc: props.code,
      extensions: extensions,
      parent: containerRef.current,
    });

    return () => {
      view.destroy();
    };
  }, [props.code, props.fileExtension]);

  return {
    containerRef: containerRef,
  };
}

function getLanguageSupportForFileExtension(
  fileExtension: string,
): LanguageSupport | undefined {
  const jsExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
  const jsonExtensions = new Set(['.json', '.jsonc']);
  const markdownExtensions = new Set(['.md']);

  if (jsExtensions.has(fileExtension)) {
    return javascript();
  }
  if (jsonExtensions.has(fileExtension)) {
    return json();
  }
  if (markdownExtensions.has(fileExtension)) {
    return markdown();
  }
}
