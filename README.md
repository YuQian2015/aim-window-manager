# AIM Window Manager

`@aim-packages/window-manager` 是一个专为 Electron 应用设计的强大窗口管理库。它提供了一套优雅的 API 来管理窗口的创建、生命周期、状态持久化以及复杂的窗口跟随行为。

## 特性

- **集中式配置管理**：通过配置表统一管理所有窗口的选项、路由和行为。
- **窗口状态持久化**：自动保存和恢复窗口的位置、大小等状态到用户数据目录 (`windows.json`)。
- **智能跟随窗口**：支持创建相对于主窗口定位的“跟随窗口”（如侧边栏、工具提示），具备自动碰撞检测和位置偏好设置。
- **平台特定覆盖**：支持针对不同操作系统（Windows, macOS, Linux）应用不同的窗口配置。
- **生命周期控制**：支持 `hideOnClose`（关闭时隐藏）、`closeOnBlur`（失焦关闭）等常见窗口行为。
- **TypeScript 支持**：完全使用 TypeScript 编写，提供完整的类型定义。

## 安装

```bash
pnpm add @aim-packages/window-manager
# 或
npm install @aim-packages/window-manager
# 或
yarn add @aim-packages/window-manager
```

## 基础使用

### 1. 定义窗口配置

在你的主进程代码中，定义窗口的配置。

```typescript
import { WindowConfig, WindowConfigMap } from '@aim-packages/window-manager';

// 定义窗口键值类型（可选，为了更好的类型提示）
declare module '@aim-packages/window-manager' {
  interface CustomWindowKeys {
    'main': void;
    'settings': void;
    'helper': void;
  }
}

export const myWindowConfigs: WindowConfigMap = {
  main: {
    routeHash: '/', // 页面路由 hash
    options: {
      width: 800,
      height: 600,
      title: 'Main Window',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    },
    // 窗口关闭时退出应用（通常用于主窗口）
    // 注意：库本身不直接处理 app.quit，需结合业务逻辑
  },
  settings: {
    routeHash: '/settings',
    options: {
      width: 400,
      height: 300,
      resizable: false,
    },
    hideOnClose: true, // 关闭时隐藏而不是销毁
    autoCenterOn: 'primary-display', // 在主屏幕居中
  },
};
```

### 2. 初始化并启动

在 Electron 的主进程入口文件中初始化管理器。

```typescript
import { app } from 'electron';
import { windowManager, initWindowConfigs } from '@aim-packages/window-manager';
import { myWindowConfigs } from './configs';

// 初始化配置
initWindowConfigs(myWindowConfigs);

// 设置开发环境下的服务器 URL 和生产环境下的文件路径
windowManager.setBaseUrl(
  process.env.VITE_DEV_SERVER_URL || '', 
  path.join(__dirname, '../renderer/index.html')
);

app.whenReady().then(async () => {
  // 打开主窗口
  await windowManager.open('main');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

## 高级功能

### 跟随窗口 (Follower Windows)

跟随窗口可以自动吸附在主窗口的周围，非常适合用于实现辅助工具、详情面板等。

```typescript
const helperConfig: WindowConfig = {
  routeHash: '/helper',
  options: {
    width: 200,
    height: 400,
    frame: false, // 通常跟随窗口是无边框的
  },
  followMain: true, // 启用跟随主窗口移动
  followerPreferMode: 'prefer-right', // 优先显示在右侧
  // 可选模式: 'auto' | 'prefer-right' | 'prefer-left' | 'prefer-bottom' | 'prefer-top' | 'overlap-center'
};
```

### 平台特定配置 (Platform Overlays)

你可以为特定平台覆盖通用配置：

```typescript
const config: WindowConfig = {
  routeHash: '/',
  options: { title: 'App' },
  platformOverlays: {
    darwin: {
      options: { titleBarStyle: 'hiddenInset' } // macOS 特有配置
    },
    win32: {
      options: { frame: false } // Windows 特有配置
    }
  }
};
```

### 窗口状态存储

窗口的位置和大小会自动保存到 `AppData/YourApp/data/windows.json` 中。当窗口再次打开时，会自动恢复到上次的位置。

## API 参考

### `windowManager`

- **`open(key: WindowKey, params?: any): Promise<BrowserWindow | undefined>`**
  打开或激活指定键的窗口。
- **`close(key: WindowKey): void`**
  关闭指定窗口。
- **`get(key: WindowKey): BrowserWindow | undefined`**
  获取窗口实例。
- **`setBaseUrl(devServerUrl: string, fileUrl: string): void`**
  设置加载页面的基础地址。
- **`setAnchor(width: number, height: number): void`**
  设置跟随窗口计算位置时的锚点尺寸（通常是主窗口的内容区域尺寸）。

### `WindowConfig` 接口

| 属性 | 类型 | 说明 |
|------|------|------|
| `routeHash` | `string \| () => string` | 窗口加载的 URL hash |
| `options` | `BrowserWindowConstructorOptions` | Electron 窗口构造选项 |
| `hideOnClose` | `boolean` | 关闭时是否仅隐藏 |
| `closeOnBlur` | `boolean` | 失焦时是否自动关闭 |
| `autoCenterOn` | `'parent-display' \| 'primary-display' \| 'none'` | 自动居中策略 |
| `followMain` | `boolean \| 'auto'` | 是否跟随主窗口移动 |
| `followerPreferMode` | `FollowerPreferMode` | 跟随位置偏好 |
| `platformOverlays` | `Record<Platform, Partial<WindowConfig>>` | 平台特定配置覆盖 |

## License

MIT
