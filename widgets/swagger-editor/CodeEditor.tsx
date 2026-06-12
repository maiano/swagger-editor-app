"use client";

import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import CodeMirror from "@uiw/react-codemirror";

import type { SchemaFormat } from "@/entities/schema/model";

interface CodeEditorProps {
  value: string;
  format: SchemaFormat;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, format, onChange }: CodeEditorProps) {
  return (
    <div className="editor-surface">
      <CodeMirror
        value={value}
        height="560px"
        extensions={[format === "json" ? json() : yaml()]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
        }}
        onChange={onChange}
        theme="dark"
      />
    </div>
  );
}
