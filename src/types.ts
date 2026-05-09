import type { BrowserWindowConstructorOptions } from 'electron';

// 跟随窗口位置偏好模式
export type FollowerPreferMode = 'auto' | 'prefer-right' | 'prefer-left' | 'prefer-bottom' | 'prefer-top' | 'fixed-top' | 'overlap-center';

// 窗口配置的键类型
export interface CustomWindowKeys { }

export type WindowKey = keyof CustomWindowKeys | (string & {});

// 跟随窗口位置类型
export type FollowerSide = 'right' | 'left' | 'bottom' | 'top' | 'overlap';

export type WindowAnimationEasing =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-out-quad'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic';

export type WindowAnimationCurve = 'line' | 'quadratic' | 'cubic';

export type WindowAnimationAnchor =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

export type WindowAnimationDisplay = 'primary' | 'current' | 'main';

export type WindowAnimationCoordinateSpaceType = 'absolute' | 'design-area';

export type WindowAnimationCoordinateFitMode = 'contain' | 'cover' | 'stretch';

export type WindowAnimationSizeMode = 'absolute' | 'scale-with-area';

export type WindowAnimationOrientation = 'landscape' | 'portrait';

export interface WindowAnimationDesignArea {
  width: number;
  height: number;
}

export interface WindowAnimationCoordinateSpace {
  /**
   * absolute keeps x/y/control points as desktop pixels.
   * design-area maps x/y/control points from a design canvas into the target
   * display/work area at playback time.
   * Default: absolute when coordinateSpace is omitted, design-area when present.
  */
  type?: WindowAnimationCoordinateSpaceType;
  designArea?: WindowAnimationDesignArea;
  /**
   * Display used for design-area mapping.
   * Default: current
   */
  display?: WindowAnimationDisplay;
  /**
   * Use Electron display.workArea instead of full display.bounds.
   * Default: true
   */
  useWorkArea?: boolean;
  /**
   * contain preserves the design aspect ratio inside the target area.
   * cover preserves aspect ratio and fills the target area.
   * stretch maps x/y independently and may distort paths.
   * Default: contain
   */
  fitMode?: WindowAnimationCoordinateFitMode;
  /**
   * Keep width/height in desktop pixels by default. Use scale-with-area only
   * when the window should resize with the coordinate mapping.
   * Default: absolute
   */
  sizeMode?: WindowAnimationSizeMode;
}

export type WindowAnimationMargin =
  | number
  | {
      x?: number;
      y?: number;
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

export interface WindowAnimationPlacement {
  /**
   * Semantic target on the resolved display/work area. For example:
   * - right: right edge + vertical center
   * - top: top edge + horizontal center
   * - top-left: top-left corner
   */
  anchor: WindowAnimationAnchor;
  /**
   * Display used to resolve the semantic anchor.
   * - current: display nearest to the previous keyframe/current window bounds
   * - main: display containing the manager main window
   * - primary: OS primary display
   * Default: current
   */
  display?: WindowAnimationDisplay;
  /**
   * Use Electron display.workArea instead of full display.bounds.
   * Default: true
   */
  useWorkArea?: boolean;
  /**
   * Distance from display/work-area edges. A number applies to every edge.
   */
  margin?: WindowAnimationMargin;
  /**
   * Additional pixel offset after anchor resolution.
   */
  offset?: Partial<WindowAnimationPoint>;
}

export interface WindowAnimationPoint {
  x: number;
  y: number;
}

export interface WindowAnimationBounds extends WindowAnimationPoint {
  width: number;
  height: number;
}

export interface WindowAnimationKeyframe extends Partial<WindowAnimationBounds> {
  /**
   * Semantic placement resolved at playback time. When present, it overrides
   * x/y while width/height still come from the keyframe or fallback bounds.
   */
  placement?: WindowAnimationPlacement;
  /**
   * Duration from the previous keyframe to this keyframe.
   * The first keyframe ignores duration.
   */
  duration?: number;
  easing?: WindowAnimationEasing;
  /**
   * Path interpolation from the previous keyframe to this one.
   * - line: straight line
   * - quadratic: one absolute control point in control1
   * - cubic: two absolute control points in control1/control2
   */
  curve?: WindowAnimationCurve;
  control1?: WindowAnimationPoint;
  control2?: WindowAnimationPoint;
  opacity?: number;
}

export interface WindowAnimationTimelineVariant {
  keyframes?: WindowAnimationKeyframe[];
  coordinateSpace?: WindowAnimationCoordinateSpace;
  /**
   * Window-local point that follows x/y/control points for this variant.
   * Default: inherited from timeline, then top-left.
   */
  positionAnchor?: WindowAnimationAnchor;
}

export interface WindowAnimationTimeline {
  id?: string;
  /**
   * Absolute desktop/screen keyframes. Missing fields inherit from the
   * current window bounds or the previous keyframe.
   */
  keyframes: WindowAnimationKeyframe[];
  /**
   * Optional coordinate mapping for ordinary x/y keyframes and bezier control
   * points. Placement anchors are still resolved semantically.
   */
  coordinateSpace?: WindowAnimationCoordinateSpace;
  /**
   * Window-local point that follows x/y/control points.
   * - top-left keeps historical behavior.
   * - center makes the window center follow the path.
   * Default: top-left
   */
  positionAnchor?: WindowAnimationAnchor;
  /**
   * Optional orientation-specific authoring tracks. The manager picks one by
   * the target display/work-area shape, then falls back to keyframes.
   */
  variants?: Partial<Record<WindowAnimationOrientation, WindowAnimationTimelineVariant>>;
  /**
   * Create the window from registered config when it is not open yet.
   * Default: false
   */
  createIfMissing?: boolean;
  /**
   * Show the window before animation starts.
   * Default: true
   */
  showBeforePlay?: boolean;
  /**
   * Clamp animated bounds into the nearest display work area.
   * Default: false
   */
  clampToWorkArea?: boolean;
  /**
   * Temporarily pause followMain positioning updates while the animation owns
   * the window bounds. The follower relationship is restored after playback.
   * Default: true
   */
  suspendFollowMainDuringPlay?: boolean;
  /**
   * Immediately refresh followMain position after playback finishes/stops.
   * Default: false
   */
  refreshFollowerAfterPlay?: boolean;
}

export interface WindowAnimationState {
  active: boolean;
  animationId?: string;
  windowKey?: WindowKey;
  progress: number;
  elapsedMs: number;
  durationMs: number;
  currentBounds?: WindowAnimationBounds;
  currentOpacity?: number;
}

export interface WindowAnimationPlaybackResult {
  ok: boolean;
  animationId?: string;
  state?: WindowAnimationState;
  error?: string;
}

export interface WindowAnimationStopOptions {
  complete?: boolean;
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
   * - 'fixed-top': 固定在主窗口上方并跟随主窗口移动，不自动切换到其他方向
   * - 'overlap-center': 重叠居中
   */
  followerPreferMode?: FollowerPreferMode;
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
