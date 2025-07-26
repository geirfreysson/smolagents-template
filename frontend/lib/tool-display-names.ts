/**
 * Maps tool names to user-friendly display names
 */
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  get_weather: "Checked weather",
  // Add more tool mappings here as needed
  // example_tool: "Performed example action",
};

/**
 * Gets a friendly display name for a tool, falling back to the original name if no mapping exists
 */
export function getToolDisplayName(toolName: string): string {
  return TOOL_DISPLAY_NAMES[toolName] || `Used tool: ${toolName}`;
}