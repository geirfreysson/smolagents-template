import { NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the latest message from the user
    const userMessage = messages[messages.length - 1]?.content || "";
    
    // Prepare conversation history (exclude the latest message as it's sent separately)
    const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
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
        message: userMessage,
        conversation_history: conversationHistory,
        context: {}
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    // Return the streaming response directly to assistant-ui
    return new Response(response.body, {
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
