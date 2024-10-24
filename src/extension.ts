import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('create-new-page');
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
      const filePaths = config.get<string[]>("filePaths");
      const templateFilePath = path.join(context.extensionPath, 'templates', 'template.html');
      var templateContent = fs.readFileSync(templateFilePath, 'utf8');
      var htmlImportPath = {js:"",css:""};
      try{
        // フォルダ作成
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
        filePaths?.forEach((filepath)=>{
          const sections = filepath.split("/");
          const extPattern = /\.(js)|(css)/g;
          var dir = filepath;
          var file:string|null = null;
          if(extPattern.test(sections[sections.length-1])){
            file = sections[sections.length-1];
            dir = dir.slice(0,-(file.length+1));
            var splited_file_path = file.split(".");
            htmlImportPath[splited_file_path[splited_file_path.length-1] as "js"|"css"] = filepath;
          }
          fs.mkdirSync(path.join(folderPath, dir));
          if(file){
            fs.writeFileSync(path.join(folderPath,dir,file),"",{flag:"w"});
          }
        })
        // htmlファイル作成
        const htmlPath = path.join(folderPath, "index.html");
        templateContent = templateContent.replace("{{ import section }}",
          `<link rel="stylesheet" href="./${htmlImportPath.css}">\n`
          +`    <script src="./${htmlImportPath.js}" defer></script>`);
        fs.writeFileSync(htmlPath, templateContent, { flag: 'w' });
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