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
    vscode.commands.registerCommand("help50.ask", async (args) => {
      try {
        const errorMessage = args[0];
        const ddb50 = vscode.extensions.getExtension("cs50.ddb50");
        const api = ddb50!.exports;
        const displayMessage = "Explain terminal error";
        const payload = {
          api: "/api/v1/help",
          config: "chat_cs50",
          error_message: errorMessage,
          stream: true
        };
        const contextMessage = `${displayMessage}:\n\`\`\`${args[1]}`;
        api.requestGptResponse(displayMessage, contextMessage, payload);
      } catch (error) {
        console.error(error);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("help50.say", async (args) => {
      try {
        const ddbMessage = args[0];
        const ddb50 = vscode.extensions.getExtension("cs50.ddb50");
        const api = ddb50!.exports;
        api.requestDuckSay(ddbMessage);
      } catch (error) {
        console.error(error);
      }
    })
  );
}

export function deactivate() {}
