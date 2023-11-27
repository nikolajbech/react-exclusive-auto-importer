import * as vscode from "vscode";
import ts from "typescript";

export function activate() {
  const configuration = vscode.workspace.getConfiguration(
    "auto-import-selected"
  );

  vscode.workspace.onDidSaveTextDocument(() => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;

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
            usedComponents.add(node.tagName.text);
          }

          ts.forEachChild(node, visit);
        }

        // Start the AST traversal
        visit(ast);

        const namedImports = configuration.get("namedImports") as {
          [key: string]: string;
        };
        const defaultImports = configuration.get("defaultImports") as {
          [key: string]: string;
        };

        const edits = new vscode.WorkspaceEdit();
        const insertedElements: string[] = [];

        // Check if the component is already imported
        usedComponents.forEach((componentName) => {
          if (allNamedImports.includes(componentName)) {
            return;
          }

          if (namedImports[componentName]) {
            insertedElements.push(componentName);
            edits.insert(
              document.uri,
              new vscode.Position(0, 0),
              `import { ${componentName} } from '${namedImports[componentName]}'\n`
            );
          }
        });

        // Check if the component is already imported
        usedComponents.forEach((componentName) => {
          if (allDefaultImports.includes(componentName)) {
            return;
          }

          if (defaultImports[componentName]) {
            insertedElements.push(componentName);
            edits.insert(
              document.uri,
              new vscode.Position(0, 0),
              `import ${componentName} from '${defaultImports[componentName]}'\n`
            );
          }
        });

        insertedElements.length > 0 &&
          vscode.window.showInformationMessage(
            "Auto imported: " + insertedElements.join(", ")
          );

        // Apply the edits
        vscode.workspace.applyEdit(edits);
      }
    }
  });

  vscode.window.showInformationMessage("Auto Import Selected is now active!");
}

export function deactivate() {}
