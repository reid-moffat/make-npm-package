class Readme {

    private readonly _packageName: string;

    constructor(packageName: string) {
        this._packageName = packageName;
    }

    public getReadmeString() {
        return `# ${this._packageName}

## Description

A brief description of your package goes here.

## Installation

\`\`bash
npm install ${this._packageName}
\`\`

## Usage

...

## Contributing

...

## Tests

\`\`bash
npm test
\`\`


`;
    }
}

export default Readme;
