import type { MessageParam, ToolUnion } from "@anthropic-ai/sdk/resources";
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { bash } from "./tools/bash.js";

const SYSTEM_PROMPT = "You are an helpful assistant.";
const TOOLS: ToolUnion[] = [bash];

import { createInterface } from "node:readline/promises";
import { agentLoop } from "./agents/agent_loop.js";

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function main() {
    const messages: MessageParam[] = [];
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    while (true) {
        const query = await rl.question("Input: ");
        if (query.trim().toLowerCase() === "q") {
            rl.close();
            break;
        }
        messages.push({ role: "user", content: query });
        await agentLoop(messages, client, SYSTEM_PROMPT, TOOLS);
        const responseContent = messages[messages.length - 1]?.content;
        if (Array.isArray(responseContent)) {
            for (const block of responseContent) {
                if (block.type === "text") {
                    console.log(block.text);
                }
            }
        }
    }
}

main();
