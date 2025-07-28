import { TextContentPartComponent } from "@assistant-ui/react";
import { MarkdownText } from "./markdown-text";
import { ToolCallDisplay } from "./tool-call-display";
import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export const EnhancedText: TextContentPartComponent = (props) => {
  let text = props.text;
  
  // If text contains tool calls, we need to show both tool calls AND any final answer text
  if (typeof text === 'string' && text.includes('__TOOL_CALL__:')) {
    const renderedParts: ReactNode[] = [];
    let currentIndex = 0;
    let lastToolCallEnd = 0;
    
    // Process all tool calls first
    while (currentIndex < text.length) {
      const toolCallStart = text.indexOf('__TOOL_CALL__:', currentIndex);
      
      if (toolCallStart === -1) {
        break;
      }
      
      // Extract the JSON by counting braces
      const jsonStart = toolCallStart + '__TOOL_CALL__:'.length;
      let braceCount = 0;
      let jsonEnd = jsonStart;
      let inString = false;
      let escaped = false;
      
      for (let i = jsonStart; i < text.length; i++) {
        const char = text[i];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\') {
          escaped = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') {
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }
      }
      
      // Try to parse the extracted JSON
      try {
        const jsonStr = text.slice(jsonStart, jsonEnd);
        const toolCallData = JSON.parse(jsonStr);
        
        renderedParts.push(
          <ToolCallDisplay 
            key={`tool-${renderedParts.length}`}
            toolName={toolCallData.name}
            arguments={toolCallData.arguments}
            result={toolCallData.result}
          />
        );
        
        lastToolCallEnd = jsonEnd;
        currentIndex = jsonEnd;
      } catch (e) {
        console.error('Failed to parse tool call JSON:', e);
        // Skip this malformed tool call and continue
        currentIndex = toolCallStart + '__TOOL_CALL__:'.length;
      }
    }
    
    // After processing tool calls, check if there's additional text (final answer)
    const finalAnswerText = text.slice(lastToolCallEnd).trim();
    console.log("🔍 DEBUG finalAnswerText:", JSON.stringify(finalAnswerText));
    console.log("🔍 DEBUG finalAnswerText length:", finalAnswerText.length);
    console.log("🔍 DEBUG finalAnswerText preview:", finalAnswerText.substring(0, 100));
    
    if (finalAnswerText && !finalAnswerText.includes('__TOOL_CALL__:')) {
      renderedParts.push(
        <div key="final-answer" className="prose max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
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
            }}
          >
            {finalAnswerText}
          </ReactMarkdown>
        </div>
      );
    }
    
    return <div className="space-y-4">{renderedParts}</div>;
  }

  
  // Regular markdown text
  return <MarkdownText />;
};