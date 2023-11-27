# React Exclusive Auto Importer Extension

## Overview

The React Exclusive Auto Importer is a Visual Studio Code (VSCode) extension designed to automate the import of React components in TypeScriptReact files. It analyzes your TypeScriptReact code and automatically adds import statements for the components you are using in your JSX.

## Features

- **Automatic Import:** The extension automatically identifies React components used in your TypeScriptReact files and adds import statements for them.

- **Configuration:** You can configure named imports and default imports for specific components through the extension settings.

## Installation

1. Open VSCode.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or use the keyboard shortcut `Ctrl+Shift+X`.
3. Search for "React Exclusive Auto Importer" in the Extensions view search box.
4. Click on the "Install" button to install the extension.

## Usage

1. Ensure the extension is installed and activated.
2. Open a TypeScriptReact file.
3. As you write JSX code, the extension will automatically detect the components you use.
4. If a component is not already imported, the extension will add the appropriate import statement at the beginning of the file.

## Configuration

You can configure the extension by modifying your VSCode settings. Add the following configuration options to your `settings.json` file:

```json
"react-exclusive-auto-importer": {
  "namedImports": {
    "ComponentName": "path/to/component-file",
    // Add other named imports as needed
  },
  "defaultImports": {
    "ComponentName": "path/to/component-file",
    // Add other default imports as needed
  }
}
```

- `namedImports`: Specify named imports for specific components.
- `defaultImports`: Specify default imports for specific components.

## Examples

### Example 1: Basic Usage

```tsx
// Before
const App = () => {
  return <MyComponent />;
};
```

```tsx
// After
import { MyComponent } from "path/to/component-file";

const App = () => {
  return <MyComponent />;
};
```

### Example 2: Configuring Named Imports

```json
"react-exclusive-auto-importer": {
  "namedImports": {
    "CustomComponent": "components/CustomComponent",
    "AnotherComponent": "components/AnotherComponent"
  }
}
```

```tsx
// Before
const App = () => {
  return <CustomComponent />;
};
```

```tsx
// After
import { CustomComponent } from "components/CustomComponent";

const App = () => {
  return <CustomComponent />;
};
```

## License

This extension is licensed under the MIT License.

## Issues and Contributions

If you encounter any issues or would like to contribute to the development of this extension, please visit the [GitHub repository](https://github.com/nikolajbech/react-exclusive-auto-importer).

## Author

Nikolaj Bech Andersen / [Website](https://prozense.com) / [GitHub](https://github.com/nikolajbech)
