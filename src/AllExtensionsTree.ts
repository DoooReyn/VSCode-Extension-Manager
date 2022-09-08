import { join } from 'path';
import * as vscode from 'vscode';
import { debug } from './DebugLog';

export class AllExtensionsTDP implements vscode.TreeDataProvider<ExtensionItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ExtensionItem | undefined | void> =
    new vscode.EventEmitter<ExtensionItem | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<ExtensionItem | undefined | void> =
    this._onDidChangeTreeData.event;

  private _context: vscode.ExtensionContext;

  constructor(private context: vscode.ExtensionContext) {
    this._context = context;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  get defaultIconPath() {
    return join(this._context.extensionPath, 'extension.svg');
  }

  getTreeItem(element: ExtensionItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ExtensionItem | undefined): vscode.ProviderResult<ExtensionItem[]> {
    debug('AllExtensionsTDP 获取子项', element);
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(this.getAllExtensions());
    }
  }

  getAllExtensions(): ExtensionItem[] {
    const excluded_publisher = ['vscode', 'ms-vscode', 'ms-vscode-remote'];
    const valid_extensions: any[] = [];
    const extensions: ExtensionItem[] = [];
    vscode.extensions.all
      .filter(
        (e) =>
          !/.*(?:\\\\|\/)resources(?:\\\\|\/)app(?:\\\\|\/)extensions(?:\\\\|\/).*/i.test(
            e.extensionPath,
          ),
      )
      .forEach((v) => {
        const extension = {
          id: v.id,
          name: v.packageJSON.displayName,
          description: v.packageJSON.description,
          root: v.extensionPath,
          icon: v.packageJSON.icon
            ? join(v.extensionPath, v.packageJSON.icon)
            : this.defaultIconPath,
          publisher: v.packageJSON.publisher,
        };
        const ext = new ExtensionItem(
          extension.name,
          extension.description,
          extension.id,
          extension.icon,
        );
        if (!excluded_publisher.includes(extension.publisher)) {
          const information = `[${v.packageJSON.publisher}] ${v.packageJSON.displayName} <${v.id}>`;
          extensions.push(ext);
          valid_extensions.push(information);
        }
      });
    debug(`当前所有扩展数量: ${extensions.length}`);
    debug(valid_extensions);
    return extensions;
  }
}

export class ExtensionItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly extensionId: string,
    public readonly iconPath: string | undefined,
    public readonly command?: vscode.Command,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.contextValue = 'extension';
    this.tooltip = this.description;
  }
}
