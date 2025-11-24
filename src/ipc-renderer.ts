import { ipcRenderer } from 'electron';

import type { WindowConfig, IpcParams } from './types';
import type { WindowKey } from './types';
import type { WindowState } from './window-state-store';

type WindowIpcParams = {
  /**
   * 移动窗口
   */
  'window:move': IpcParams<[{ x: number; y: number }, WindowKey?], boolean>;
  'window:position:get': IpcParams<[WindowKey?], [number, number]>;
  'screen:size:get': IpcParams<[void], { width: number; height: number }>;
  /**
   * 设置窗口大小
   */
  'window:size:set': IpcParams<[string, number, number, boolean?], { success: boolean; bounds?: { x: number; y: number; width: number; height: number }; error?: string }>;
  /**
   * 获取窗口大小
   */
  'window:size:get': IpcParams<[string], { success: boolean; bounds?: { x: number; y: number; width: number; height: number }; error?: string }>;
  /**
   * 设置窗口是否穿透点击
   */
  'window:click:through': IpcParams<[boolean], boolean>;
  'window:open': IpcParams<[WindowKey, any?, { sameDisplayAsSender?: boolean }?], boolean>;
  'window:open:ready': IpcParams<[WindowKey], boolean>;
  'window:payload:get': IpcParams<[WindowKey], any>;
  'window:close': IpcParams<[WindowKey], boolean>;
  /** 窗口抖动 */
  'window:shake': IpcParams<[WindowKey], boolean>;
  /** 发送消息给其他窗口 */
  'window:send': IpcParams<[WindowKey, string, any], boolean>;
  /** 最小化当前窗口 */
  'window:minimize': IpcParams<[void], boolean>;
  /** 最大化或还原当前窗口 */
  'window:maximize': IpcParams<[void], { maximized: boolean }>;
  /** 关闭当前窗口 */
  'window:close:self': IpcParams<[void], boolean>;
  /** 当前窗口是否已最大化 */
  'window:maximized:get': IpcParams<[void], boolean>;
  /** 当前窗口能力（是否允许最小化/最大化/缩放） */
  'window:capabilities:get': IpcParams<[void], { minimizable: boolean; maximizable: boolean; resizable: boolean }>;
  /** 保存窗口状态 */
  'window:state:save': IpcParams<[WindowKey], boolean>;
  /** 获取窗口状态 */
  'window:state:get': IpcParams<[WindowKey], WindowState | undefined>;
  /** 清除窗口状态 */
  'window:state:clear': IpcParams<[WindowKey], boolean>;
  /** 注册/覆盖窗口配置 */
  'window:config:register': IpcParams<[WindowKey, WindowConfig, { persist?: boolean; openNow?: boolean; payload?: any }?], { ok: boolean; error?: string }>;
  /** 取消注册窗口配置 */
  'window:config:unregister': IpcParams<[WindowKey, { persist?: boolean; closeIfOpen?: boolean; removeState?: boolean }?], { ok: boolean; error?: string }>;
  /** 列出所有窗口 key */
  'window:config:list': IpcParams<[void], string[]>;
  /** 获取窗口配置 */
  'window:config:get': IpcParams<[WindowKey], WindowConfig | undefined>;
};

const methods: Array<keyof WindowIpcParams> = [
  'window:move',
  'window:position:get',
  'screen:size:get',
  'window:size:set',
  'window:size:get',
  'window:click:through',
  'window:open',
  'window:open:ready',
  'window:payload:get',
  'window:close',
  'window:shake',
  'window:send',
  'window:minimize',
  'window:maximize',
  'window:close:self',
  'window:maximized:get',
  'window:capabilities:get',
  'window:state:save',
  'window:state:get',
  'window:state:clear',
  'window:config:register',
  'window:config:unregister',
  'window:config:list',
  'window:config:get'
];

export type WindowIpcType = {
  [K in keyof WindowIpcParams]: (...args: WindowIpcParams[K]['request']) => Promise<WindowIpcParams[K]['response']>;
};

const newIpc: Record<string, any> = {};

methods.forEach((method) => {
  newIpc[method] = (...args: WindowIpcParams[typeof method]['request']) => ipcRenderer.invoke(method, ...args);
});

export const windowIpcRenderer = {
  ...newIpc
} as WindowIpcType;

export function onWindowMessage(channel: string, callback: (payload: any) => void): () => void {
  const handler = (_: any, payload: any) => callback(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
