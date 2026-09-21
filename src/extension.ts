import * as vscode from "vscode";

// The most recent message relayed from the terminal, and how the duck should handle it:
// "say" repeats it as the duck's own words (a local helper already produced advice), and
// "ask" sends it to cs50.ai for an explanation (no local helper matched).
type ButtonAction = "ask" | "say";
let latestErrorMessage = "";
let latestButtonAction: ButtonAction | "" = "";

// Note: the context key is window-global, not per-terminal, so a failure in one terminal
// shows the button for all terminals, and the most recent failure wins.
async function setButtonVisible(visible: boolean) {
  await vscode.commands.executeCommand("setContext", "help50:didActivateButton", visible);
}

// ddb50 exposes its API through activate(); calling activate() on an already-active
// extension is a no-op that returns the same exports.
async function ddb50Api(): Promise<any | undefined> {
  const ddb50 = vscode.extensions.getExtension("cs50.ddb50");
  if (!ddb50) {
    vscode.window.showErrorMessage("help50: the CS50 Duck (ddb50) extension is not installed.");
    return undefined;
  }
  return await ddb50.activate();
}

export function activate(context: vscode.ExtensionContext) {

  // Invoked from the terminal via `command50 help50.showButton <ask|say> "<message>"`
  context.subscriptions.push(
    vscode.commands.registerCommand("help50.showButton", async (args) => {
      if (!Array.isArray(args) || args.length !== 2) {
        console.error("help50.showButton: expected [action, message], got", args);
        return;
      }
      const [action, message] = args;

      if (action !== "ask" && action !== "say") {
        console.error("help50.showButton: invalid action", action);
        return;
      }
      if (typeof message !== "string") {
        console.error("help50.showButton: message is not a string", message);
        return;
      }

      // Nothing to show (e.g., a command that failed silently): treat as hide
      if (message.trim() === "") {
        await vscode.commands.executeCommand("help50.hideButton");
        return;
      }

      latestButtonAction = action;
      latestErrorMessage = message;
      await setButtonVisible(true);
    })
  );

  // Invoked from the terminal via `command50 help50.hideButton` after a successful command
  context.subscriptions.push(
    vscode.commands.registerCommand("help50.hideButton", async () => {
      latestErrorMessage = "";
      latestButtonAction = "";
      await setButtonVisible(false);
    })
  );

  // The button itself
  context.subscriptions.push(
    vscode.commands.registerCommand("help50.askForHelp", async () => {
      if (latestButtonAction === "" || latestErrorMessage === "") {
        await vscode.commands.executeCommand("help50.hideButton");
        return;
      }
      try {
        await vscode.commands.executeCommand(`help50.${latestButtonAction}`, [latestErrorMessage]);
      } catch (error) {
        console.error(error);
      }
    })
  );

  // Ask cs50.ai to explain the error
  context.subscriptions.push(
    vscode.commands.registerCommand("help50.ask", async (args) => {
      try {
        const errorMessage = args[0];
        const api = await ddb50Api();
        if (!api) {
          return;
        }
        const displayMessage = "Explain terminal error";
        const payload = {
          api: "/api/v1/help",
          config: "chat_cs50",
          error_message: errorMessage,
          stream: true
        };
        const contextMessage = `${displayMessage}:\n\n${errorMessage}`;
        await api.requestGptResponse(displayMessage, contextMessage, payload);
        await vscode.commands.executeCommand("help50.hideButton");
      } catch (error) {
        console.error(error);
      }
    })
  );

  // Have the duck say the helper's advice
  context.subscriptions.push(
    vscode.commands.registerCommand("help50.say", async (args) => {
      try {
        const ddbMessage = args[0];
        const api = await ddb50Api();
        if (!api) {
          return;
        }
        await api.requestDuckSay(ddbMessage);
        await vscode.commands.executeCommand("help50.hideButton");
      } catch (error) {
        console.error(error);
      }
    })
  );
}

export function deactivate() {}
