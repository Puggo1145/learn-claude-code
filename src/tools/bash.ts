import type { Tool } from "@anthropic-ai/sdk/resources";
import { execSync } from "node:child_process";

export const bash: Tool = {
    name: "bash",
    description: "Execute a bash command and return stdout/stderr. Dangerous commands (rm -rf, sudo, shutdown, reboot, mkfs, dd, etc.) are blocked.",
    input_schema: {
        type: "object",
        properties: {
            command: {
                type: "string",
                description: "The bash command to execute"
            },
            timeout: {
                type: "number",
                description: "Timeout in milliseconds (default: 10000)"
            }
        },
        required: ["command"]
    },
};


export function runBash(command: string, timeout = 10000): string {
    const DANGEROUS_PATTERNS = [
        /\brm\s+(-[^\s]*)?r/,       // rm -r, rm -rf, rm -fr, etc.
        /\bsudo\b/,
        /\bshutdown\b/,
        /\breboot\b/,
        /\bmkfs\b/,
        /\bdd\b/,
        /\b:(){ :|:& };:/,          // fork bomb
        />\s*\/dev\/sd/,            // overwrite disk
        /\bchmod\s+777\b/,
        /\bchown\s+-R\b/,
        /\bkill\s+-9\s+1\b/,
        /\binit\s+0\b/,
        /\bsystemctl\s+(poweroff|halt)\b/,
    ];
    for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(command)) {
            return `[BLOCKED] Dangerous command detected: "${command}"`;
        }
    }

    try {
        const result = execSync(command, {
            timeout,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
            maxBuffer: 1024 * 1024,
        });
        return result || "(no output)";
    } catch (err: any) {
        if (err.killed) {
            return `[ERROR] Command timed out after ${timeout}ms`;
        }
        const stderr = err.stderr || "";
        const stdout = err.stdout || "";
        return `[ERROR] Exit code ${err.status}\n${stdout}\n${stderr}`.trim();
    }
}
