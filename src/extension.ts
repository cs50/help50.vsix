import * as vscode from "vscode";

// Global variable to hold the latest error message
let latestErrorMessage = "";
let latestButtonAction = "";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("help50.showButton", async (args) => {
      if (args.length !== 2) {
        vscode.window.showErrorMessage("Invalid number of arguments", args.length);
        console.error("Invalid number of arguments", args.length);
        return;
      }

      if (!["ask", "say"].includes(args[0])) {
        vscode.window.showErrorMessage("Invalid button action", latestButtonAction);
        console.error("Invalid button action", latestButtonAction);
        return;
      }
      latestButtonAction = args[0];

      if (typeof args[1] !== "string") {
        vscode.window.showErrorMessage("Invalid error message", args[1]);
        console.error("Invalid error message", args[1]);
        return;
      }
      latestErrorMessage = args[1];

      await vscode.commands.executeCommand(
        "setContext",
        "help50:didActivateButton",
        true
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("help50.hideButton", async () => {
      latestErrorMessage = "";
      await vscode.commands.executeCommand(
        "setContext",
        "help50:didActivateButton",
        false
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("help50.askForHelp", async () => {
      if (latestButtonAction === "ask") {
        try {
          await vscode.commands.executeCommand("help50.ask", [latestErrorMessage]);
          await vscode.window.showInformationMessage("Asking for help...\n" + latestErrorMessage);
        } catch (error) {
          console.error(error);
        }
      }
      else if (latestButtonAction === "say") {
        try {
          await vscode.commands.executeCommand("help50.say", [latestErrorMessage]);
          await vscode.window.showInformationMessage("Saying the message...\n" + latestErrorMessage);
        } catch (error) {
          console.error(error);
        }
      }
    }
  ));

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
        await api.requestGptResponse(displayMessage, contextMessage, payload);
        await vscode.commands.executeCommand("help50.hideButton");
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
