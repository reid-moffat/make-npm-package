class Readme {

    private readonly _packageName: string;

    constructor(packageName: string) {
        this._packageName = packageName;
    }

    public getReadmeString() {
        const header = `# ${this._packageName}\n`;
        const description = `A brief description of your package goes here\n`;
        const installation = `## 📦 Installation\n\n\`\`\`bash\nnpm install ${this._packageName}\n\`\`\`\n`;
        const usage = `## 🚀 Usage\n\n...\n`;

        return header + description + installation + usage;
    }
}

export default Readme;
