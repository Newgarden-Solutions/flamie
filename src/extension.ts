// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from "child_process";

const execShell = (cmd: string) =>
new Promise<string>((resolve, reject) => {
	cp.exec(cmd, (err, out) => {
		if (err) {
			reject(err);
		}
		
		return resolve(out);
	});
});

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension is active.');

	vscode.window.onDidCloseTerminal((terminal) => {
		if (terminal.exitStatus && terminal.exitStatus.code) { 
			vscode.window.showInformationMessage(`Exit code: ${terminal.exitStatus.code}`); 
		}
	});

	// Show information about extension itself
	context.subscriptions.push(vscode.commands.registerCommand('flamie.showExtensionInfo', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Info about flamie');
	}));

	// Create a new game using ignite-cli
	context.subscriptions.push(vscode.commands.registerCommand('flamie.createNewGame', async () => {
		let newGameDirectory: string;

		const installIgniteCli = vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			cancellable: false,
			title: 'Installing ignite-cli...'
		}, async (progress) => {
			
			progress.report({  increment: 0 });
		
			try {
				console.log('Checking ignite-cli...');

				const output = await execShell('ignite --help');
				console.log(output);
			} catch (e) {
				console.error(e);

				console.log('Installing ignite-cli...');
	
				await execShell('pub global activate ignite_cli');

				console.log('Verifying ignite-cli...');

				try {
					await execShell('ignite --help');
				} catch (e) {
					console.error(e);
					console.log('Failed to create a new game.');
				}
			}

			progress.report({ increment: 100 });
		});
		
		await installIgniteCli;

		const terminal = vscode.window.terminals[0];
		const output = await execShell('ignite create');
		
		console.error(output);
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
