// 用户管理工具函数

import { UserModel, DomainModel } from 'hydrooj';
import { CONFIG, ERROR_MESSAGES } from './config';

/**
 * 验证用户权限操作
 */
export async function validatePrivilegeOperation(
  targetUserId: number,
  currentUserPriv: number,
  currentUserId: number,
  operation: 'ban' | 'setPriv' | 'resetPassword' | 'delete'
): Promise<void> {
  const targetUser = await UserModel.getById('system', targetUserId);
  if (!targetUser) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // 检查是否尝试操作超级管理员
  if (targetUser.priv === CONFIG.PRIVILEGES.SUPER_ADMIN && currentUserPriv !== CONFIG.PRIVILEGES.SUPER_ADMIN) {
    throw new Error(ERROR_MESSAGES.CANNOT_DELETE_SUPER_ADMIN);
  }

  // 检查封禁操作
  if (operation === 'ban' && targetUser.priv === CONFIG.PRIVILEGES.SUPER_ADMIN) {
    throw new Error(ERROR_MESSAGES.CANNOT_DELETE_SUPER_ADMIN);
  }

  // 检查删除操作
  if (operation === 'delete') {
    if (targetUser.priv === CONFIG.PRIVILEGES.SUPER_ADMIN) {
      throw new Error(ERROR_MESSAGES.CANNOT_DELETE_SUPER_ADMIN);
    }
    if (targetUserId === currentUserId) {
      throw new Error(ERROR_MESSAGES.CANNOT_DELETE_SELF);
    }
  }
}

/**
 * 生成随机密码
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * 格式化用户信息用于显示
 */
export function formatUserInfo(user: any) {
  return {
    id: user._id,
    username: user.uname || 'N/A',
    email: user.mail || 'N/A',
    school: user.school || '未设置',
    bio: user.bio || '未设置',
    registrationTime: user.regat ? new Date(user.regat).toLocaleString() : '未知',
    lastLogin: user.loginat ? new Date(user.loginat).toLocaleString() : '从未登录',
    privilege: user.priv || CONFIG.PRIVILEGES.DEFAULT_USER
  };
}

/**
 * 验证搜索参数
 */
export function validateSearchParams(search: string, type: string): boolean {
  if (!search) return true;

  if (search.length < CONFIG.SEARCH.MIN_SEARCH_LENGTH) {
    return false;
  }

  if (search.length > CONFIG.SEARCH.MAX_SEARCH_LENGTH) {
    return false;
  }

  // 验证搜索类型
  const validTypes = ['uname', 'mail', '_id'];
  if (!validTypes.includes(type)) {
    return false;
  }

  // 如果是ID搜索，验证是否为数字
  if (type === '_id' && isNaN(parseInt(search, 10))) {
    return false;
  }

  return true;
}

/**
 * 构建搜索查询
 */
export function buildSearchQuery(search: string, type: string): any {
  if (!search) return {};

  const query: any = {};

  switch (type) {
    case 'uname':
      query.uname = new RegExp(search, 'i');
      break;
    case 'mail':
      query.mail = new RegExp(search, 'i');
      break;
    case '_id':
      query._id = parseInt(search, 10);
      break;
    default:
      // 默认搜索所有字段
      query.$or = [
        { uname: new RegExp(search, 'i') },
        { mail: new RegExp(search, 'i') },
        { _id: isNaN(+search) ? undefined : +search }
      ].filter(Boolean);
  }

  return query;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 导出用户数据
 */
export function exportUsers(users: any[], format: 'csv' | 'json'): string {
  if (format === 'csv') {
    return exportToCSV(users);
  } else {
    return exportToJSON(users);
  }
}

function exportToCSV(users: any[]): string {
  const headers = ['ID', '用户名', '邮箱', '学校', '注册时间', '最后登录', '权限'];
  const rows = users.map(user => [
    user._id,
    user.uname || '',
    user.mail || '',
    user.school || '',
    user.regat ? new Date(user.regat).toISOString() : '',
    user.loginat ? new Date(user.loginat).toISOString() : '',
    user.priv || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

function exportToJSON(users: any[]): string {
  const formattedUsers = users.map(user => ({
    id: user._id,
    username: user.uname,
    email: user.mail,
    school: user.school,
    bio: user.bio,
    registrationTime: user.regat,
    lastLogin: user.loginat,
    privilege: user.priv
  }));

  return JSON.stringify(formattedUsers, null, 2);
}