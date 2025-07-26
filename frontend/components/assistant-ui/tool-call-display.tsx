import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { getToolDisplayName } from "../../lib/tool-display-names";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ToolCallDisplayProps {
  toolName: string;
  arguments: Record<string, unknown>;
  result: string;
}

export const ToolCallDisplay = ({ toolName, arguments: args, result }: ToolCallDisplayProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Special handling for final_answer tool - only show result, not the tool card
  if (toolName === 'final_answer') {
    return (
      <div className="prose max-w-none">
        <div className="text-base leading-7">
          {/* Use the result from final_answer tool as the main response 
              The "result" field contains the final answer to show to the user */}
          <div className="aui-md">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ className, ...props }) => (
                  <h1 className={cn("mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0", className)} {...props} />
                ),
                h2: ({ className, ...props }) => (
                  <h2 className={cn("mb-4 mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0", className)} {...props} />
                ),
                h3: ({ className, ...props }) => (
                  <h3 className={cn("mb-4 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0", className)} {...props} />
                ),
                h4: ({ className, ...props }) => (
                  <h4 className={cn("mb-4 mt-6 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0", className)} {...props} />
                ),
                h5: ({ className, ...props }) => (
                  <h5 className={cn("my-4 text-lg font-semibold first:mt-0 last:mb-0", className)} {...props} />
                ),
                h6: ({ className, ...props }) => (
                  <h6 className={cn("my-4 font-semibold first:mt-0 last:mb-0", className)} {...props} />
                ),
                p: ({ className, ...props }) => (
                  <p className={cn("mb-5 mt-5 leading-7 first:mt-0 last:mb-0", className)} {...props} />
                ),
                a: ({ className, ...props }) => (
                  <a className={cn("text-primary font-medium underline underline-offset-4", className)} {...props} />
                ),
                blockquote: ({ className, ...props }) => (
                  <blockquote className={cn("border-l-2 pl-6 italic", className)} {...props} />
                ),
                ul: ({ className, ...props }) => (
                  <ul className={cn("my-5 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
                ),
                ol: ({ className, ...props }) => (
                  <ol className={cn("my-5 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
                ),
                hr: ({ className, ...props }) => (
                  <hr className={cn("my-5 border-b", className)} {...props} />
                ),
                table: ({ className, ...props }) => (
                  <table className={cn("my-5 w-full border-separate border-spacing-0 overflow-y-auto", className)} {...props} />
                ),
                th: ({ className, ...props }) => (
                  <th className={cn("bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
                ),
                td: ({ className, ...props }) => (
                  <td className={cn("border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
                ),
                tr: ({ className, ...props }) => (
                  <tr className={cn("m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg", className)} {...props} />
                ),
                sup: ({ className, ...props }) => (
                  <sup className={cn("[&>a]:text-xs [&>a]:no-underline", className)} {...props} />
                ),
                pre: ({ className, ...props }) => (
                  <pre className={cn("overflow-x-auto rounded-b-lg bg-black p-4 text-white", className)} {...props} />
                ),
                code: ({ className, ...props }) => (
                  <code className={cn("bg-muted rounded border font-semibold", className)} {...props} />
                ),
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular tool call display
  return (
    <div className="mb-4 flex w-full flex-col gap-3 rounded-lg border py-3">
      <div className="flex items-center gap-2 px-4">
        <CheckIcon className="size-4" />
        <p className="">
          <b>{getToolDisplayName(toolName)}</b>
        </p>
        <div className="flex-grow" />
        <Button onClick={() => setIsCollapsed(!isCollapsed)} variant="ghost" size="sm">
          {isCollapsed ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
        </Button>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col gap-2 border-t pt-2">
          <div className="px-4">
            <p className="font-semibold mb-1">Arguments:</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>
          <div className="border-t border-dashed px-4 pt-2">
            <p className="font-semibold mb-1">Result:</p>
            <pre className="whitespace-pre-wrap text-sm">
              {result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};