import type { Tool as AnthropicToolDef } from "@anthropic-ai/sdk/resources";

export type ToolName = string;
export type ToolDef = AnthropicToolDef;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolHandler = (input: any) => string | Promise<string>;

export interface Tool {
    definition: ToolDef;
    handler: ToolHandler;
}

export type ToolSet = Record<string, Tool>;

export class ToolProvider {
    private tools: Record<ToolName, Tool>;

    constructor() {
        this.tools = {};
    }

    register(tools: ToolSet) {
        for (const toolName in tools) {
            this.tools[toolName] = tools[toolName]!;
        }
    }

    getToolHandler(toolName: string): ToolHandler {
        if (!(toolName in this.tools)) {
            throw new Error(`Tool "${toolName}" does not exist. Available tools: ${this.listAllToolNames()}`);
        }

        return this.tools[toolName]!.handler;
    }

    getToolDefinitions(): Array<Tool["definition"]> {
        return Object.values(this.tools).map(tool => tool.definition);
    }

    listAllToolNames(): string {
        return Object.keys(this.tools).join(", ");
    }
}

// 创建空实例，由 index.ts 负责注册工具
export const toolProviderParent = new ToolProvider();
export const toolProviderChild = new ToolProvider();
