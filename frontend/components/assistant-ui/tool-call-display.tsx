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
  
  // Special handling for final_answer tool - don't show as a tool card
  if (toolName === 'final_answer') {
    return null; // Don't render final_answer tool cards
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