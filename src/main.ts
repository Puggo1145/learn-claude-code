import client from "./agents/client.js";
import type { MessageParam } from "@anthropic-ai/sdk/resources";
import { initSystemPrompt } from "./prompt/systemPrompt.js";
import { createInterface } from "node:readline/promises";
import { agentLoop } from "./agents/agent-loop.js";

import { initSkillRegistry } from "./infra/skills.js";

function getModel() {
    const MODEL = process.env.MODEL;
    if (!MODEL) {
        throw new Error("MODEL is not set");
    }
    return MODEL;
}

const MODEL = getModel();
const WORKDIR = process.cwd();
const SKILL_DIR = `${WORKDIR}/skills`;

async function main() {
    const skillRegistry = initSkillRegistry(SKILL_DIR);
    const skillsPrompt = skillRegistry.getPromptForSkills();

    const systemPrompt = initSystemPrompt({ workDir: WORKDIR, skills: skillsPrompt });

    const messages: MessageParam[] = [];
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    while (true) {
        const query = await rl.question("Input: ");
        if (query.trim().toLowerCase() === "q") {
            rl.close();
            break;
        }
        messages.push({ role: "user", content: query });
        await agentLoop(messages, client, MODEL, systemPrompt);
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
