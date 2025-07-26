import { TextContentPartComponent } from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { ToolCallDisplay } from "./tool-call-display";
import { ReactNode } from "react";

export const EnhancedText: TextContentPartComponent = (props) => {
  const text = props.text;
  
  // Check if this text contains tool calls
  if (typeof text === 'string' && text.includes('__TOOL_CALL__:')) {
    // First pass: check if we have a final_answer tool
    const hasFinalAnswer = text.includes('"name":"final_answer"');
    
    const renderedParts: ReactNode[] = [];
    let currentIndex = 0;
    
    // Find all tool call markers and extract their JSON properly
    while (currentIndex < text.length) {
      const toolCallStart = text.indexOf('__TOOL_CALL__:', currentIndex);
      
      if (toolCallStart === -1) {
        // No more tool calls, add remaining text only if we don't have a final_answer tool
        // (since final_answer tool already displays the final response prominently)
        const remainingText = text.slice(currentIndex).trim();
        if (remainingText && !hasFinalAnswer) {
          renderedParts.push(
            <div key={`text-end`} className="prose">
              {remainingText}
            </div>
          );
        }
        break;
      }
      
      // Add any text before the tool call (only if we don't have final_answer)
      if (toolCallStart > currentIndex) {
        const textBefore = text.slice(currentIndex, toolCallStart).trim();
        if (textBefore && !hasFinalAnswer) {
          renderedParts.push(
            <div key={`text-${renderedParts.length}`} className="prose">
              {textBefore}
            </div>
          );
        }
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
        
        currentIndex = jsonEnd;
      } catch (e) {
        console.error('Failed to parse tool call JSON:', e);
        // Skip this malformed tool call and continue
        currentIndex = toolCallStart + '__TOOL_CALL__:'.length;
      }
    }
    
    return <div className="space-y-4">{renderedParts}</div>;
  }
  
  // Regular markdown text
  return <MarkdownTextPrimitive remarkPlugins={[remarkGfm]} className="aui-md" />;
};