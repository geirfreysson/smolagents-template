
export const runtime = "edge";
export const maxDuration = 30;

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the latest message from the user and extract text properly
    const latestMessage = messages[messages.length - 1];
    let userMessageText = "";
    
    if (typeof latestMessage?.content === "string") {
      userMessageText = latestMessage.content;
    } else if (Array.isArray(latestMessage?.content)) {
      // Extract text from content array format
      userMessageText = latestMessage.content
        .filter((part: { type: string }) => part.type === "text")
        .map((part: { text: string }) => part.text)
        .join(" ");
    }
    
    // Prepare conversation history (exclude the latest message as it's sent separately)
    const conversationHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content
    }));

    // Call our Python backend
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: [{ type: "text", text: userMessageText }],
        conversation_history: conversationHistory,
        context: {}
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    // Create a transform stream to convert backend events to assistant-ui format
    const activeCalls = new Map(); // Track active tool calls
    
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const decoder = new TextDecoder();
        const text = decoder.decode(chunk);
        
        // Split by lines to handle multiple events in one chunk
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const eventData = JSON.parse(line.slice(2));
              
              switch (eventData.type) {
                case 'tool_call_start':
                  // Store tool call for later completion
                  activeCalls.set(eventData.tool_call_id, {
                    name: eventData.tool_name,
                    arguments: eventData.tool_arguments
                  });
                  // Don't send anything yet, wait for completion
                  break;
                  
                case 'tool_call_complete':
                case 'tool_call_final':
                  // Send complete tool call information as a single message part
                  const toolCall = activeCalls.get(eventData.tool_call_id);
                  if (toolCall) {
                    // Embed tool call data in a special text format
                    const toolCallData = {
                      name: toolCall.name,
                      arguments: toolCall.arguments,
                      result: eventData.result
                    };
                    
                    const specialText = `__TOOL_CALL__:${JSON.stringify(toolCallData)}`;
                    controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(specialText)}\n`));
                    activeCalls.delete(eventData.tool_call_id);
                  }
                  break;
                  
                case 'text':
                  // Forward text chunks directly
                  controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(eventData.content)}\n`));
                  break;
                  
                case 'final_answer':
                case 'final_result':
                  // Forward final answer
                  controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(eventData.content)}\n`));
                  break;
                  
                default:
                  // Skip unknown event types
                  console.log('Unknown event type:', eventData.type);
                  break;
              }
            } catch (e) {
              console.error('Failed to parse event:', line, e);
              // Forward the line as-is if parsing fails
              controller.enqueue(chunk);
            }
          } else if (line === 'd:') {
            // Forward end-of-stream marker
            controller.enqueue(new TextEncoder().encode('d:\n'));
          }
        }
      }
    });

    // Pipe the backend response through our transform stream
    const transformedStream = response.body?.pipeThrough(transformStream);

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Error calling backend:", error);
    
    // Return a proper error stream
    const errorStream = new ReadableStream({
      start(controller) {
        const errorText = "I'm sorry, I encountered an error while processing your request. Please make sure the backend server is running.";
        controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(errorText)}\n`));
        controller.enqueue(new TextEncoder().encode(`d:\n`));
        controller.close();
      }
    });
    
    return new Response(errorStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
