import { describe, it, expect } from "vitest";
import { toolProviderParent as toolProvider } from "../../src/tools/index.js";
import crypto from "node:crypto";

const EXPECTED_TOOLS = ["bash", "read", "write", "edit", "todo", "task", "skill"];

describe("ToolProvider", () => {
    describe("getToolDefinitions", () => {
        it("returns exactly the registered tools, no more no less", () => {
            const defs = toolProvider.getToolDefinitions();
            const names = defs.map((d) => d.name);

            expect(names.sort()).toEqual([...EXPECTED_TOOLS].sort());
        });

        it("every definition has a non-empty description and input_schema", () => {
            for (const def of toolProvider.getToolDefinitions()) {
                expect(def.description).toBeTruthy();
                expect(def.input_schema).toBeTruthy();
            }
        });
    });

    describe("getToolHandler", () => {
        it("returns a callable function for each registered tool", () => {
            for (const name of EXPECTED_TOOLS) {
                const h = toolProvider.getToolHandler(name);
                expect(h, `handler for '${name}' should be a function`).toBeTypeOf("function");
            }
        });

        it("throws for a random unregistered name", () => {
            const fake = `__no_tool_${crypto.randomBytes(4).toString("hex")}`;
            expect(() => toolProvider.getToolHandler(fake)).toThrow();
        });
    });

    describe("listAllToolNames", () => {
        it("contains every registered tool name", () => {
            const csv = toolProvider.listAllToolNames();
            for (const name of EXPECTED_TOOLS) {
                expect(csv).toContain(name);
            }
        });
    });
});
