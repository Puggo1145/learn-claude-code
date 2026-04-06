import { bashTool } from "./bash.js";
import { readTool } from "./read.js";
import { writeTool } from "./write.js";
import { editTool } from "./edit.js";
import { todoTool } from "./todo.js";
import { taskTool } from "./task.js";
import { toolProviderParent, toolProviderChild } from "./tool-provider.js";
import type { ToolSet } from "./tool-provider.js";

const BASE_TOOLS: ToolSet = {
    "bash": bashTool,
    "read": readTool,
    "write": writeTool,
    "edit": editTool,
}
const PARENT_TOOLS: ToolSet = {
    ...BASE_TOOLS,
    "todo": todoTool,
    "task": taskTool
}

// tools for parent agent
toolProviderParent.register(PARENT_TOOLS);

// tools for child agent
toolProviderChild.register(BASE_TOOLS);

export { toolProviderParent, toolProviderChild };
export type { ToolDef, ToolHandler, Tool } from "./tool-provider.js";
