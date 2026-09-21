import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 2022,
            sourceType: "module",
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        rules: {
            "@typescript-eslint/naming-convention": ["warn", {
                selector: "import",
                format: ["camelCase", "PascalCase"],
            }],
            curly: "warn",
            eqeqeq: "warn",
            "no-throw-literal": "warn",
            semi: "warn",
        },
    },
);
