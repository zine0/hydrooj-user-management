import $ from 'jquery';
import { NamedPage } from 'vj/misc/Page';
import Notification from 'vj/components/notification';
import { request } from 'vj/utils';
import i18n from 'vj/utils/i18n';
import pjax from 'vj/utils/pjax';

const page = new NamedPage('user_manage_main', () => {
  // 搜索功能
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    const keyword = $('#search-keyword').val().trim();
    const type = $('#search-type').val();
    const sort = $('#sort-by').val();
    const order = $('#sort-order').val();

    const url = new URL(window.location);

    if (keyword) {
      url.searchParams.set(type, keyword);
    } else {
      url.searchParams.delete('uname');
      url.searchParams.delete('mail');
      url.searchParams.delete('_id');
    }

    if (sort) {
      url.searchParams.set('sort', sort);
    }
    if (order) {
      url.searchParams.set('order', order);
    }

    // 移除page参数以回到第一页
    url.searchParams.delete('page');

    pjax.request({ url: url.toString() });
  });
  
  // 清空搜索
  $('#clear-search').on('click', function() {
    $('#search-keyword').val('');
    $('#search-type').val('uname');
    $('#sort-by').val('_id');
    $('#sort-order').val('desc');

    const url = new URL(window.location);
    url.searchParams.delete('uname');
    url.searchParams.delete('mail');
    url.searchParams.delete('_id');
    url.searchParams.delete('sort');
    url.searchParams.delete('order');
    url.searchParams.delete('page');

    pjax.request({ url: url.toString() });
  });
  
  // 快速封禁/解封用户
  $('.ban-user').on('click', async function(e) {
    e.preventDefault();
    const $button = $(this);
    const uid = $button.data('uid');
    const username = $button.data('username');
    const action = $button.data('action');

    const confirmMessage = action === 'ban'
      ? i18n('Are you sure to ban user {0}?', username)
      : i18n('Are you sure to unban user {0}?', username);

    if (!confirm(confirmMessage)) {
      return;
    }

    $button.prop('disabled', true).addClass('disabled');

    try {
      const response = await request.post(`/manage/users/${uid}`, {
        operation: action === 'ban' ? 'ban' : 'unban'
      });

      if (response.success) {
        Notification.success(action === 'ban' ? i18n('User banned successfully') : i18n('User unbanned successfully'));
        // 使用pjax刷新页面以保持状态
        pjax.request({ url: window.location.href });
      } else {
        Notification.error(response.message || i18n('Operation failed'));
        $button.prop('disabled', false).removeClass('disabled');
      }
    } catch (error) {
      console.error('Error:', error);
      Notification.error(i18n('Operation failed'));
      $button.prop('disabled', false).removeClass('disabled');
    }
  });
  
  // 快速设置权限
  $('.set-priv').on('click', async function(e) {
    e.preventDefault();
    const $button = $(this);
    const uid = $button.data('uid');
    const username = $button.data('username');
    const currentPriv = $button.data('priv');

    const newPriv = prompt(i18n('Enter new privilege value for user {0}:', username), currentPriv);
    if (newPriv === null || newPriv === '') {
      return;
    }

    const privValue = parseInt(newPriv, 10);
    if (isNaN(privValue)) {
      Notification.error(i18n('Invalid privilege value'));
      return;
    }

    if (!confirm(i18n('Are you sure to set privilege of user {0} to {1}?', username, privValue))) {
      return;
    }

    $button.prop('disabled', true).addClass('disabled');

    try {
      const response = await request.post(`/manage/users/${uid}`, {
        operation: 'setPriv',
        priv: privValue
      });

      if (response.success) {
        Notification.success(i18n('Privilege updated successfully'));
        // 使用pjax刷新页面以保持状态
        pjax.request({ url: window.location.href });
      } else {
        Notification.error(response.message || i18n('Operation failed'));
        $button.prop('disabled', false).removeClass('disabled');
      }
    } catch (error) {
      console.error('Error:', error);
      Notification.error(i18n('Operation failed'));
      $button.prop('disabled', false).removeClass('disabled');
    }
  });

  // 删除用户
  $('.delete-user').on('click', async function(e) {
    e.preventDefault();
    const $button = $(this);
    const uid = $button.data('uid');
    const username = $button.data('username');

    const confirmMessage = i18n('Are you sure to delete user {0}? This action cannot be undone!', username);

    if (!confirm(confirmMessage)) {
      return;
    }

    $button.prop('disabled', true).addClass('disabled');

    try {
      const response = await request.post(`/manage/users/${uid}`, {
        operation: 'delete'
      });

      if (response.success) {
        Notification.success(i18n('User deleted successfully'));
        // 使用pjax刷新页面以保持状态
        pjax.request({ url: window.location.href });
      } else {
        Notification.error(response.message || i18n('Operation failed'));
        $button.prop('disabled', false).removeClass('disabled');
      }
    } catch (error) {
      console.error('Error:', error);
      Notification.error(i18n('Operation failed'));
      $button.prop('disabled', false).removeClass('disabled');
    }
  });
  
  // 分页链接处理
  $('.pagination a').on('click', function(e) {
    e.preventDefault();
    const url = $(this).attr('href');
    if (url && url !== '#') {
      pjax.request({ url });
    }
  });
  
  // 排序链接处理
  $('.sortable').on('click', function(e) {
    e.preventDefault();
    const sort = $(this).data('sort');
    const currentSort = new URLSearchParams(window.location.search).get('sort');
    const currentOrder = new URLSearchParams(window.location.search).get('order') || 'desc';
    
    let newOrder = 'desc';
    if (currentSort === sort && currentOrder === 'desc') {
      newOrder = 'asc';
    }
    
    const url = new URL(window.location);
    url.searchParams.set('sort', sort);
    url.searchParams.set('order', newOrder);
    
    pjax.request({ url: url.toString() });
  });
  
  // 批量操作按钮
  $('#batch-operations').on('click', function() {
    window.location.href = '/manage/users/batch';
  });
  
  // 导出用户数据
  $('#export-users').on('click', async function() {
    try {
      const response = await request.get('/manage/users', {
        export: 'csv'
      });
      
      // 创建下载链接
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      Notification.success(i18n('Export completed'));
    } catch (error) {
      console.error('Export error:', error);
      Notification.error(i18n('Export failed'));
    }
  });
  
  // 刷新按钮
  $('#refresh-list').on('click', function() {
    window.location.reload();
  });
  
  // 键盘快捷键
  $(document).on('keydown', function(e) {
    // Ctrl+F 聚焦搜索框
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      $('#search-keyword').focus();
    }
    
    // Enter 键提交搜索
    if (e.key === 'Enter' && $('#search-keyword').is(':focus')) {
      $('#search-form').submit();
    }
  });
  
  // 初始化提示
  $('[data-tooltip]').each(function() {
    $(this).attr('title', $(this).data('tooltip'));
  });
});

export default page;