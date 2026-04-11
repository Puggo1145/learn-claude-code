import type { ToolDef } from "./index.js";
import { getSkillRegistry } from "../infra/skills.js";

const definition: ToolDef = {
    name: "skill",
    description: "Load a skill by name. Use this when the user invokes a skill (e.g. /pdf) or when a task matches an available skill.",
    input_schema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "The name of the skill to load",
            },
        },
        required: ["name"],
    },
};

function handler({ name }: { name: string }): string {
    return getSkillRegistry().loadBody(name);
}

function formatCall(input: unknown): string {
    const obj = input as Record<string, unknown>;
    const name = obj?.name;
    if (typeof name !== "string") return `Skill(${JSON.stringify(input)})`;
    return `Skill(${name})`;
}

export const skillTool = {
    definition,
    handler,
    formatCall,
};
