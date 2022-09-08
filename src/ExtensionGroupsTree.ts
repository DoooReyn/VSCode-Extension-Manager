import * as vscode from 'vscode';
import { debug } from './DebugLog';

export class ExtensionGroupsProvider implements vscode.TreeDataProvider<GroupItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<GroupItem | undefined | void> =
    new vscode.EventEmitter<GroupItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<GroupItem | undefined | void> =
    this._onDidChangeTreeData.event;
  private _context: vscode.ExtensionContext;

  constructor(private context: vscode.ExtensionContext) {
    this._context = context;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: GroupItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: GroupItem): Thenable<GroupItem[]> {
    debug('ExtensionGroupsProvider 获取子项', element);
    // const extensions = vscode.extensions.all.map((v) => {
    //   return {
    //     id: v.id,
    //     name: v.packageJSON.displayName,
    //     description: v.packageJSON.description,
    //     root: v.extensionPath,
    //     icon: path.join(v.extensionPath, v.packageJSON.icon),
    //     publisher: v.packageJSON.publisher,
    //   };
    // });

    if (element) {
      return Promise.resolve(this.getNodes(element));
    } else {
      return Promise.resolve(this.getAllGroups());
    }
  }

  private getAllGroups(): GroupItem[] {
    let items: GroupItem[] = [];
    const groups = this._context.globalState.get<string[]>('groups');
    if (groups) {
      items = groups.map((g) => {
        return new GroupItem(g, 'group', vscode.TreeItemCollapsibleState.Collapsed);
      });
    }
    debug('本地存储:', this._context.globalState.keys());
    debug('当前扩展组:', items);
    return items;
  }

  private getNodes(item: GroupItem): GroupItem[] {
    let items: GroupItem[] = [];
    const extensions = this._context.globalState.get<string[]>(item.label);
    if (extensions) {
      items = extensions.map((ext) => {
        return new GroupItem(ext, 'group-extension', vscode.TreeItemCollapsibleState.None);
      });
    }
    debug(`扩展组${item.label}所属的扩展数量: ${items.length}`);
    return items;
  }
}

export class GroupItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly ckey: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
  ) {
    super(label, collapsibleState);

    this.tooltip = this.description = this.label;
    this.contextValue = ckey;
  }

  // iconPath = {
  //   light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
  //   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg'),
  // };
}
