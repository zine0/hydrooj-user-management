// 用户管理插件配置

export const CONFIG = {
  // 分页设置
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 100,
    VISIBLE_PAGES: 5
  },

  // 搜索设置
  SEARCH: {
    DEBOUNCE_DELAY: 300, // 搜索防抖延迟(毫秒)
    MIN_SEARCH_LENGTH: 2, // 最小搜索长度
    MAX_SEARCH_LENGTH: 50 // 最大搜索长度
  },

  // 权限设置
  PRIVILEGES: {
    SUPER_ADMIN: -1,
    BANNED: 0,
    SYSTEM_RESERVED: 4,
    GUEST: 8,
    DEFAULT_USER: 16842756
  },

  // 操作确认设置
  CONFIRMATION: {
    BAN_USER: true,
    UNBAN_USER: true,
    RESET_PASSWORD: true,
    SET_PRIVILEGE: true,
    DELETE_USER: true
  },

  // 导出设置
  EXPORT: {
    MAX_RECORDS: 1000,
    SUPPORTED_FORMATS: ['csv', 'json']
  },

  // 缓存设置
  CACHE: {
    USER_LIST_TTL: 300, // 用户列表缓存时间(秒)
    USER_DETAIL_TTL: 600 // 用户详情缓存时间(秒)
  }
};

// 权限描述映射
export const PRIVILEGE_DESCRIPTIONS = {
  [-1]: '超级管理员',
  [0]: '已封禁',
  [4]: '系统保留',
  [8]: '访客用户',
  [16842756]: '默认用户权限'
};

// 错误消息
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: '用户不存在',
  PERMISSION_DENIED: '权限不足',
  INVALID_OPERATION: '无效的操作',
  EMAIL_EXISTS: '邮箱已被使用',
  USERNAME_EXISTS: '用户名已被使用',
  INVALID_PRIVILEGE: '无效的权限值',
  CANNOT_DELETE_SUPER_ADMIN: '不能删除超级管理员',
  CANNOT_DELETE_SELF: '不能删除自己的账户'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  USER_UPDATED: '用户信息更新成功',
  PASSWORD_RESET: '密码重置成功',
  PRIVILEGE_UPDATED: '权限更新成功',
  USER_BANNED: '用户封禁成功',
  USER_UNBANNED: '用户解封成功',
  USER_DELETED: '用户删除成功'
};