import fs from "node:fs";
import path from "node:path";
import { globSync } from "node:fs";

interface SkillManifest {
    name: string;
    description: string;
    path: string;
}

interface Document {
    manifest: SkillManifest;
    body: string;
}

type Skill = Record<string, Document>;

class SkillRegistry {
    private skillsDir: string | undefined;
    private skills: Skill;

    constructor(skillsDir: string) {
        this.skillsDir = skillsDir;
        this.skills = {};
        this.loadAll();
    }

    private loadAll() {
        if (!this.skillsDir) return;

        const pattern = path.join(this.skillsDir, "**", "SKILL.md");
        const files = globSync(pattern);

        for (const filePath of files) {
            const content = fs.readFileSync(filePath, "utf-8");
            const doc = this.parse(filePath, content);
            this.skills[doc.manifest.name] = doc;
        }
    }

    private parse(filePath: string, content: string): Document {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);

        let name: string | undefined = undefined;
        let description: string | undefined = undefined;
        let body = content;

        if (match && match[1] && match[2]) {
            const frontmatter = match[1];
            body = match[2].trim();

            const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
            const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

            name = nameMatch?.[1]?.trim();
            description = descMatch?.[1]?.trim();
        }

        if (!name) {
            name = path.basename(path.dirname(filePath));
        }
        if (!description) {
            description = "No description";
        }

        return {
            manifest: { name, description, path: filePath },
            body,
        };
    }

    getPromptForSkills(): string {
        return Object.values(this.skills)
            .map((doc) => `- ${doc.manifest.name}: ${doc.manifest.description}`)
            .join("\n");
    }

    loadBody(name: string): string {
        const doc = this.skills[name];
        if (!doc) {
            return `Error: skill "${name}" not found`;
        }
        return `<skill name="${name}">\n${doc.body}\n</skill>`;
    }
}

let instance: SkillRegistry | undefined;

function initSkillRegistry(skillsDir: string): SkillRegistry {
    instance = new SkillRegistry(skillsDir);
    return instance;
}

function getSkillRegistry(): SkillRegistry {
    if (!instance) {
        throw new Error("SkillRegistry not initialized. Call initSkillRegistry() first.");
    }
    return instance;
}

export { initSkillRegistry, getSkillRegistry, type SkillManifest, type Document, type Skill };
