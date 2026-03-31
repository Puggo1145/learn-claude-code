import type { MessageParam, ToolUnion } from "@anthropic-ai/sdk/resources";
import type Anthropic from "@anthropic-ai/sdk";
import { runBash } from "../tools/bash.js";
import { print } from "../utils/print.js";

export async function agentLoop(messages: MessageParam[], client: Anthropic, systemPrompt: string, tools: ToolUnion[]): Promise<void> {
    while (true) {
        const response = await client.messages.create({
            model: "claude-haiku-4-5",
            system: systemPrompt,
            messages: messages,
            tools: tools,
            max_tokens: 8000
        });

        messages.push({ role: "assistant", content: response.content });

        if (response.stop_reason !== "tool_use") break;

        // run tools
        const results: MessageParam["content"] = [];
        for (const block of response.content) {
            if (block.type === "text") {
                print(block.text, "message");
            }

            if (block.type === "tool_use") {
                let output: string | undefined;
                switch (block.name) {
                    case "bash":
                        const input = block.input as { command: string, timeout: number };
                        print(`Running command: \n${input.command}`, "tool");
                        output = runBash(input.command, input.timeout);
                        print(`Command output: \n${output}`, "tool");
                        break;
                    default:
                        output = "Unknown tool";
                        break;
                }
                results.push({
                    type: "tool_result",
                    // tool use id 必须和模型返回的 tool call block 一致
                    // 直接透传即可
                    tool_use_id: block.id,
                    content: output
                })
            }
        }
        messages.push({ role: "user", content: results });
    }
}
