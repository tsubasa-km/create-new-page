import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('create-new-page.create',
    async() => {
      const pageName = await vscode.window.showInputBox({
        prompt:"Enter the page name",
        placeHolder: "example"
      })
      if(!pageName){
        return;
      }
      const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No folder is open.');
            return;
      }
      // パス取得
      const folderPath = path.join(workspaceFolders[0].uri.fsPath,pageName);
      const htmlPath = path.join(folderPath, "index.html");
      const templateFilePath = path.join(context.extensionPath, 'templates', 'template.html');
      const templateContent = fs.readFileSync(templateFilePath, 'utf8');
      try{
        // フォルダ作成
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
        fs.mkdirSync(path.join(folderPath, "css"));
        fs.mkdirSync(path.join(folderPath, "scripts"));
        // ファイル作成
        fs.writeFileSync(htmlPath, templateContent, { flag: 'w' });
        fs.writeFileSync(path.join(folderPath, "css", "style.css"), "", { flag: 'w' });
        fs.writeFileSync(path.join(folderPath, "scripts", "script.js"), "", { flag: 'w' });
        // index.htmlを開く
        const fileUri = vscode.Uri.file(htmlPath);
        const document = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(document);
      } catch (error:any) {
        vscode.window.showErrorMessage(`Error creating file: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}