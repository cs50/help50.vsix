import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("help50.showButton", async (args) => {
      console.log("help50.showButton");
      await vscode.commands.executeCommand(
        "setContext",
        "help50:didActivateButton",
        true
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("help50.hideButton", async (args) => {
      console.log("help50.hideButton");
      await vscode.commands.executeCommand(
        "setContext",
        "help50:didActivateButton",
        false
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("help50.run", async (args) => {
      console.log("help50.run");
    })
  );
}

export function deactivate() {}
