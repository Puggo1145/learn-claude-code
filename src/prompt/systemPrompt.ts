interface initParams {
    workDir: string;
    skills: string;
}

export function initSystemPrompt({ 
    workDir,
    skills
}: initParams): string {
    return `You are a coding agent at ${workDir}.
These are the skills you can use:
${skills}`;
}
