import type { MessageParam } from "@anthropic-ai/sdk/resources"
import { print } from "../utils/print.js";
import client from "./client.js"
import { toolProviderChild } from "../tools/tool-provider.js";

const MAX_LOOP_COUNT = 30;
const WORKDIR = process.cwd();
const SYSTEM_PROMPT = `You are a coding subagent at ${WORKDIR}. Complete the given task, then summarize your findings.`

interface IRunSubAgent {
    prompt: string
}

export async function runSubAgent({ prompt }: IRunSubAgent): Promise<string> {
    const subMessages: MessageParam[] = [
        { role: "user", content: prompt }
    ];

    // limit sub agent's maximum loop to ensure a controllable env
    let currentLoopCount = 0;
    while (currentLoopCount < MAX_LOOP_COUNT) {
        const response = await client.messages.create({
            // 暂时指定为 haiku
            model: "claude-haiku-4-5",
            system: SYSTEM_PROMPT,
            messages: subMessages,
            tools: toolProviderChild.getToolDefinitions(),
            max_tokens: 8000
        });
        subMessages.push({ role: "assistant", content: response.content });

        if (response.stop_reason !== "tool_use") break;

        // handle tool calls
        const results: MessageParam["content"] = [];
        for (const block of response.content) {
            if (block.type === "tool_use") {
                let output: string;
                try {
                    const handler = toolProviderChild.getToolHandler(block.name);
                    print(toolProviderChild.formatToolCall(block.name, block.input), "tool");
                    output = await handler(block.input);
                } catch (error) {
                    if (error instanceof Error && error.stack) {
                        output = `[ERROR] ${error.stack}`;
                    } else {
                        output = `[ERROR] ${block.name}: ${String(error)}`;
                    }
                }
                results.push({
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: output
                });
            }
        }
        subMessages.push({ role: "user", content: results });

        currentLoopCount++;
    }

    if (currentLoopCount >= MAX_LOOP_COUNT) {
        return `[ERROR] Sub-agent exceeded maximum loop count (${MAX_LOOP_COUNT}). The task may be incomplete.`;
    }

    // only return the last model message
    const lastModelMessage = subMessages.findLast(msg => msg.role === "assistant");
    if (!lastModelMessage) {
        return "(no summary)";
    }
    const content = lastModelMessage.content;
    if (Array.isArray(content)) {
        return content
            .filter(b => b.type === "text")
            .map(b => b.text)
            .join("") || "(no summary)";
    }
    return content;
}
