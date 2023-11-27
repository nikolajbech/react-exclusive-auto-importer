import * as vscode from "vscode";
import * as ts from "typescript";

export function activate(context: vscode.ExtensionContext) {
  const configuration = vscode.workspace.getConfiguration(
    "import-specific-elements-on-save"
  ) as unknown as {
    namedImports: Record<string, string>;
    defaultImports: Record<string, string>;
  };

  console.log(configuration);

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    console.log("Document saved: ", document.fileName);
    vscode.window.showInformationMessage("Analyzing file...");

    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;

      vscode.window.showInformationMessage(document.languageId);
      // Check if it's a TypeScript or JavaScript file
      if (document.languageId === "typescriptreact") {
        const fileName = document.fileName;
        const sourceText = document.getText();
        const ast = ts.createSourceFile(
          fileName,
          sourceText,
          ts.ScriptTarget.ES2016,
          true
        );

        if (!ast) {
          return;
        }

        const allNamedImports: string[] = [];
        const allDefaultImports: string[] = [];
        const usedComponents = new Set<string>();

        ts.forEachChild(ast, (node) => {
          if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            const importNode = node as ts.ImportDeclaration;

            // Extract specific elements from the import declaration
            const importClause = importNode.importClause;
            if (importClause) {
              const namedBindings = importClause.namedBindings;

              if (namedBindings) {
                if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
                  // Handle named imports
                  const namedImports = namedBindings as ts.NamedImports;
                  namedImports.elements.forEach((element) => {
                    allNamedImports.push(element.name.getText());
                  });
                }
              }

              // Handle default import
              const defaultImport = importClause.name;
              if (defaultImport) {
                allDefaultImports.push(defaultImport.getText());
              }
            }
          }
        });

        function visit(node: ts.Node) {
          if (ts.isJsxOpeningElement(node) && ts.isIdentifier(node.tagName)) {
            const componentName = node.tagName.text;

            console.log(node.tagName.kind);

            usedComponents.add(componentName);

            // // Check if the component is already imported
            // if (!isComponentImported(componentName, sourceText)) {
            // 	unimportedComponents.push(componentName);
            // }
          }

          ts.forEachChild(node, visit);
        }

        // Start the AST traversal
        visit(ast);

        console.log(allNamedImports);
        console.log(allDefaultImports);
        console.log(usedComponents);

        const { namedImports, defaultImports } = configuration;

        const namedImportsToInsert: string[] = [];
        const defaultImportsToInsert: string[] = [];

        // Check if the component is already imported
        usedComponents.forEach((componentName) => {
          if (allNamedImports.includes(componentName)) {
            return;
          }

          if (namedImports[componentName]) {
            namedImportsToInsert.push(namedImports[componentName]);
          }
        });

        // Check if the component is already imported
        usedComponents.forEach((componentName) => {
          if (allDefaultImports.includes(componentName)) {
            return;
          }

          if (defaultImports[componentName]) {
            defaultImportsToInsert.push(defaultImports[componentName]);
          }
        });

        console.log(namedImportsToInsert);
        console.log(defaultImportsToInsert);

        const edits = new vscode.WorkspaceEdit();

        // Insert named imports
        namedImportsToInsert.forEach((namedImport) => {
          edits.insert(
            document.uri,
            new vscode.Position(0, 0),
            `import { ${namedImport} } from "react";\n`
          );
        });

        // Insert default imports
        defaultImportsToInsert.forEach((defaultImport) => {
          edits.insert(
            document.uri,
            new vscode.Position(0, 0),
            `import ${defaultImport} from "react";\n`
          );
        });

        // Apply the edits
        vscode.workspace.applyEdit(edits);

        // // Create a TypeScript language service
        // const service = ts.createLanguageService({
        //   getScriptFileNames: () => [fileName],
        //   getScriptVersion: () => "1",
        //   getScriptSnapshot: () => ts.ScriptSnapshot.fromString(sourceText),
        //   getCurrentDirectory: () => vscode.workspace.rootPath || "",
        //   getCompilationSettings: () => ({}),
        //   getDefaultLibFileName: function (
        //     options: ts.CompilerOptions
        //   ): string {
        //     return ts.getDefaultLibFilePath(options);
        //   },
        //   readFile: function (
        //     path: string,
        //     encoding?: string | undefined
        //   ): string | undefined {
        //     if (ts.sys.fileExists(path)) {
        //       return ts.sys.readFile(path, encoding);
        //     } else {
        //       return undefined;
        //     }
        //   },
        //   fileExists: function (path: string): boolean {
        //     return true;
        //   },
        // });

        // console.log(service);

        // // Get semantic diagnostics (errors) from the language service
        // const diagnostics = service.getSemanticDiagnostics(fileName);
        // console.log(diagnostics);

        // // Check if there are any React-related diagnostics
        // const reactDiagnostics = diagnostics.filter(
        //   (diagnostic) =>
        //     diagnostic.file &&
        //     diagnostic.file.fileName === fileName &&
        //     diagnostic.source === "react"
        // );

        // if (reactDiagnostics.length > 0) {
        //   vscode.window.showInformationMessage("React elements not imported!");
        // } else {
        //   vscode.window.showInformationMessage("All good!");
        // }
      }
    }
  });

  vscode.window.showInformationMessage(
    "import-specific-elements-on-save activated!"
  );
}

export function deactivate() {}
