import type { ToolDef, ToolHandler } from "./tool-provider.js";
import { runSubAgent } from "../agents/sub-agent.js";

const definition: ToolDef = {
    name: "task",
    description: "Spawn a subagent with fresh context. It shares the filesystem but not conversation history.",
    input_schema: {
        type: "object",
        properties: {
            prompt: {
                type: "string"
            },
        }, 
        required: ["prompt"]
    }
};

const handler = runSubAgent;
function formatCall(input: unknown): string {
    const prompt = (input as Record<string, unknown>)?.prompt;
    if (typeof prompt !== "string") return `Task(${JSON.stringify(input)})`;
    const short = prompt.length > 80 ? prompt.slice(0, 77) + "..." : prompt;
    return `Task(${short})`;
}

export const taskTool = {
    definition,
    handler,
    formatCall
};
