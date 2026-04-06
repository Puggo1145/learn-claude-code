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
export const taskTool = {
    definition,
    handler
};
