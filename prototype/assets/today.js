(function () {
  var P = window.Proto;
  var mode = P.mode;
  var info = P.modeInfo;

  // 三态数据模型：status = 'done'(完成绿) / 'pending'(待完成橘) / 'undone'(未完成红)
  // note 仅 undone 时可选填写
  var TASKS = {
    adult: [
      { key: 'a-wake', name: '按时起床', emoji: '⏰', status: 'done', note: '' },
      { key: 'a-water', name: '喝一杯温水', emoji: '💧', status: 'done', note: '' },
      { key: 'a-focus', name: '专注工作 2 小时', emoji: '🎯', status: 'pending', note: '' },
      { key: 'a-exercise', name: '运动 30 分钟', emoji: '🏃', status: 'pending', note: '' },
      { key: 'a-no-phone', name: '睡前不刷手机', emoji: '📵', status: 'undone', note: '昨晚加班太晚' }
    ],
    kid: [
      { key: 'k-dress', name: '自己穿衣', emoji: '👕', status: 'done', note: '' },
      { key: 'k-brush', name: '认真刷牙', emoji: '🪥', status: 'pending', note: '' },
      { key: 'k-homework', name: '完成作业', emoji: '✏️', status: 'pending', note: '' },
      { key: 'k-reading', name: '阅读 20 分钟', emoji: '📚', status: 'pending', note: '' }
    ]
  };

  var STATUS_LABEL = {
    done: { text: '已完成', color: 'is-done' },
    pending: { text: '待完成', color: 'is-pending' },
    undone: { text: '未完成', color: 'is-undone' }
  };

  var tasks = TASKS[mode].map(function (t) { return Object.assign({}, t); });

  document.getElementById('greeting').textContent =
    P.greeting(new Date().getHours()) + '，' + info.motto;
  document.getElementById('modeLine').textContent =
    info.emoji + ' ' + info.title + ' · ' + P.formatCN(new Date());

  document.getElementById('adjustBtn').href = 'select.html?mode=' + mode;
  document.getElementById('historyBtn').href = 'history.html?mode=' + mode;

  var list = document.getElementById('taskList');
  var doneEl = document.getElementById('doneCount');
  var totalEl = document.getElementById('totalCount');
  var percentEl = document.getElementById('percent');
  var fillEl = document.getElementById('progressFill');
  var tipEl = document.getElementById('progressTip');

  function setStatus(taskKey, status) {
    var task = tasks.filter(function (t) { return t.key === taskKey; })[0];
    if (!task) return;
    if (task.status === status) return;
    task.status = status;
    if (status !== 'undone') {
      task.note = ''; // 切回非 undone 时清空备注
    }
    render();
  }

  function setNote(taskKey, note) {
    var task = tasks.filter(function (t) { return t.key === taskKey; })[0];
    if (!task) return;
    task.note = note;
  }

  function render() {
    list.innerHTML = '';
    tasks.forEach(function (task) {
      var statusInfo = STATUS_LABEL[task.status];

      var row = document.createElement('div');
      row.className = 'task ' + statusInfo.color;
      row.dataset.key = task.key;

      // 左侧三态勾选按钮组
      var tick = document.createElement('div');
      tick.className = 'ticks';
      tick.innerHTML =
        '<button class="tick-btn tick-btn--done"    data-act="done"    title="完成 ✓"></button>' +
        '<button class="tick-btn tick-btn--pending" data-act="pending" title="待完成"></button>' +
        '<button class="tick-btn tick-btn--undone"  data-act="undone"  title="未完成"></button>';
      // 根据当前 status 给对应按钮加 on 态
      Array.prototype.forEach.call(tick.querySelectorAll('[data-act]'), function (btn) {
        if (btn.dataset.act === task.status) btn.classList.add('is-on');
      });

      var body = document.createElement('div');
      body.className = 'task-body';

      var name = document.createElement('div');
      name.className = 'task-name';
      name.textContent = task.emoji + ' ' + task.name;

      var sub = document.createElement('div');
      sub.className = 'task-sub';
      sub.textContent = statusInfo.text;

      body.appendChild(name);
      body.appendChild(sub);

      // 未完成时显示红色备注输入框
      if (task.status === 'undone') {
        var noteWrap = document.createElement('div');
        noteWrap.className = 'task-note';
        var noteInput = document.createElement('input');
        noteInput.className = 'task-note-input';
        noteInput.placeholder = '写一句为什么没完成…';
        noteInput.maxLength = 40;
        noteInput.value = task.note || '';
        noteInput.addEventListener('input', function () {
          setNote(task.key, noteInput.value);
        });
        noteWrap.appendChild(noteInput);
        body.appendChild(noteWrap);
      }

      row.appendChild(tick);
      row.appendChild(body);
      list.appendChild(row);
    });

    var total = tasks.length;
    var done = tasks.filter(function (t) { return t.status === 'done'; }).length;
    var percent = total ? Math.round((done / total) * 100) : 0;

    doneEl.textContent = done;
    totalEl.textContent = total;
    percentEl.textContent = percent + '%';
    fillEl.style.width = percent + '%';

    if (total && done === total) {
      tipEl.textContent = '今天的闯关全部完成 🎉';
      tipEl.classList.add('is-done');
    } else {
      var undone = tasks.filter(function (t) { return t.status === 'undone'; }).length;
      var pending = total - done - undone;
      if (undone > 0) {
        tipEl.textContent = pending > 0
          ? '再完成 ' + pending + ' 件，还有 ' + undone + ' 件没完成'
          : '今天的 ' + undone + ' 件没完成，写下原因吧';
      } else {
        tipEl.textContent = '再完成 ' + pending + ' 件就大功告成';
      }
      tipEl.classList.remove('is-done');
    }
  }

  // 事件委托：点按钮切换状态；点其他区域不影响
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.tick-btn');
    if (!btn) return;
    var row = btn.closest('.task');
    if (!row) return;
    setStatus(row.dataset.key, btn.dataset.act);
  });

  render();
})();
