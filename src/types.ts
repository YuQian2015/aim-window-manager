import type { BrowserWindowConstructorOptions } from 'electron';

// 跟随窗口位置偏好模式
export type FollowerPreferMode = 'auto' | 'prefer-right' | 'prefer-left' | 'prefer-bottom' | 'prefer-top' | 'overlap-center';

// 窗口配置的键类型
export interface CustomWindowKeys { }

export type WindowKey = keyof CustomWindowKeys | (string & {});

// 跟随窗口位置类型
export type FollowerSide = 'right' | 'left' | 'bottom' | 'top' | 'overlap';

// 固定窗口位置配置
export type WindowFixedPositionEdge = 'top' | 'bottom' | 'left' | 'right';
export type WindowFixedPositionAlign = 'start' | 'center' | 'end';
export type WindowFixedPositionDisplay = 'primary' | 'main' | 'self';

export interface WindowFixedPositionConfig {
  /**
   * 固定到屏幕的哪一侧。
   */
  edge: WindowFixedPositionEdge;
  /**
   * 沿着固定边的对齐方式。
   * - top/bottom: 控制横向位置
   * - left/right: 控制纵向位置
   * 默认: center
   */
  align?: WindowFixedPositionAlign;
  /**
   * 与屏幕工作区/屏幕边缘的间距。
   * 默认: 0
   */
  margin?: number;
  /**
   * 选择哪个显示器作为固定定位基准。
   * - primary: 主显示器
   * - main: 主窗口所在显示器
   * - self: 当前窗口所在显示器
   * 默认: primary
   */
  display?: WindowFixedPositionDisplay;
  /**
   * 是否使用 workArea，避免覆盖 Dock/菜单栏/任务栏。
   * 默认: true
   */
  useWorkArea?: boolean;
}

export interface WindowConfig {
  routeHash: string | (() => string);
  options: BrowserWindowConstructorOptions;
  fillWorkArea?: boolean;
  showOnReady?: boolean;
  openDevTools?: boolean;
  autoCenterOn?: 'parent-display' | 'primary-display' | 'none';
  closeOnBlur?: boolean;
  /**
   * 如果为 true，窗口将使用真正的全屏模式（可覆盖 macOS 的 Dock 和菜单栏）。
   * - macOS: 使用 simpleFullscreen
   * - 其他平台: 使用 fullscreen
   * 默认: false
   */
  trueFullscreen?: boolean;
  /**
   * 如果为 true，当用户尝试关闭窗口（例如点击关闭按钮）时，窗口将被隐藏而不是销毁。
   * 这对于需要保持后台运行或快速重新显示的窗口非常有用。
   * 默认: false
   */
  hideOnClose?: boolean;
  /**
   * 当窗口显示时，是否临时暂停主窗口的 hover 监控（用于透明跟随窗口防止穿透干扰）
   */
  suspendHoverMonitorOnShow?: boolean;
  /**
   * 当通过管理器显示窗口时，优先使用 showInactive（若可用），避免抢夺焦点。
   */
  preferShowInactive?: boolean;
  /**
   * 窗口跟随配置
   * - true: 跟随主窗口移动
   * - false: 不跟随
   * - 'auto': 由窗口管理器自动决定是否跟随
   */
  followMain?: boolean | 'auto';
  /**
   * 跟随窗口位置偏好模式
   * - 'auto': 自动选择最佳位置
   * - 'prefer-right': 优先右侧
   * - 'prefer-left': 优先左侧
   * - 'prefer-bottom': 优先底部
   * - 'prefer-top': 优先顶部
   * - 'overlap-center': 重叠居中
   */
  followerPreferMode?: FollowerPreferMode;
  /**
   * 固定窗口位置配置。它独立于 followMain：
   * - followMain === true 时保持旧的跟随主窗口行为，fixedPosition 不生效
   * - 需要固定到屏幕顶部/底部/左右侧时，省略 followMain 或设置为 false
   */
  fixedPosition?: WindowFixedPositionConfig;
  /**
   * 当使用 overlap-center 模式时，是否启用半透明效果以避免遮挡精灵
   * 默认: false
   */
  enableOverlapTransparency?: boolean;
  /**
   * 当使用 overlap-center 模式时，是否强制居中（忽略屏幕边界限制）
   * 默认: false
   */
  forceCenterAlignment?: boolean;
  parent?: 'main' | undefined;
  /**
   * If true, the window will open maximized on first show.
   * - When showOnReady !== false, it maximizes right before showing on ready-to-show to avoid flicker.
   * - When showOnReady === false, it maximizes on the first manual show.
   */
  startMaximized?: boolean;
  /**
   * If true, the window will remember its position and size for next time.
   */
  rememberState?: boolean;
  /** 平台差异化覆盖（仅用于 JSON 配置文件，运行期会根据当前平台合并到配置中） */
  platformOverlays?: Partial<Record<NodeJS.Platform, Partial<WindowConfig & { options: Partial<BrowserWindowConstructorOptions> }>>>;
}

export type IpcParams<T = void, R = unknown> = {
  /**
   * 输入
   *
   * @type {T}
   */
  request: T;
  /**
   * 输出
   *
   * @type {R}
   */
  response: R;
};

export type ResParams<T = void> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type PartialByKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredByKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
