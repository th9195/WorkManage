(function () {
  var params = new URLSearchParams(location.search);
  var mode = params.get('mode') === 'kid' ? 'kid' : 'adult';

  var MODES = {
    adult: { key: 'adult', title: '我的小闯关', emoji: '🌅', motto: '今天也为自己闯一关' },
    kid: { key: 'kid', title: '宝贝打卡站', emoji: '🧸', motto: '今天要打卡几件事呢' }
  };

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function formatCN(d) {
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + week[d.getDay()];
  }

  function dateKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function addDays(d, n) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }

  function startOfWeek(d) {
    var day = d.getDay() === 0 ? 7 : d.getDay();
    return addDays(d, 1 - day);
  }

  function greeting(hour) {
    if (hour < 5) return '夜深了';
    if (hour < 11) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }

  window.Proto = {
    mode: mode,
    modes: MODES,
    modeInfo: MODES[mode],
    formatCN: formatCN,
    dateKey: dateKey,
    addDays: addDays,
    startOfWeek: startOfWeek,
    greeting: greeting,
    weekdayCN: function (d) {
      return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    }
  };

  var dateEl = document.getElementById('todayDate');
  if (dateEl) dateEl.textContent = formatCN(new Date());

  var pageDate = document.getElementById('pageDate');
  if (pageDate) pageDate.textContent = formatCN(new Date());
})();
