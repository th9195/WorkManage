(function () {
  var P = window.Proto;
  var mode = P.mode;
  var info = P.modeInfo;

  var PRESETS = {
    adult: [
      { title: '早晨', items: [
        { key: 'a-wake', name: '按时起床', emoji: '⏰' },
        { key: 'a-water', name: '喝一杯温水', emoji: '💧' },
        { key: 'a-plan', name: '列出今日三件事', emoji: '📝' }
      ] },
      { title: '白天', items: [
        { key: 'a-focus', name: '专注工作 2 小时', emoji: '🎯' },
        { key: 'a-exercise', name: '运动 30 分钟', emoji: '🏃' },
        { key: 'a-reading', name: '阅读 20 分钟', emoji: '📖' },
        { key: 'a-walk', name: '饭后散步', emoji: '🚶' }
      ] },
      { title: '晚上', items: [
        { key: 'a-review', name: '复盘今天', emoji: '🪞' },
        { key: 'a-no-phone', name: '睡前不刷手机', emoji: '📵' },
        { key: 'a-sleep', name: '23 点前入睡', emoji: '🌙' }
      ] }
    ],
    kid: [
      { title: '自己的事', items: [
        { key: 'k-dress', name: '自己穿衣', emoji: '👕' },
        { key: 'k-brush', name: '认真刷牙', emoji: '🪥' },
        { key: 'k-tidy', name: '整理书包', emoji: '🎒' }
      ] },
      { title: '学习', items: [
        { key: 'k-homework', name: '完成作业', emoji: '✏️' },
        { key: 'k-reading', name: '阅读 20 分钟', emoji: '📚' },
        { key: 'k-handwriting', name: '练字 15 分钟', emoji: '🖊️' }
      ] },
      { title: '生活', items: [
        { key: 'k-chore', name: '做一件家务', emoji: '🧹' },
        { key: 'k-outdoor', name: '户外活动 1 小时', emoji: '⚽' },
        { key: 'k-sleep', name: '21 点前睡觉', emoji: '🛌' }
      ] }
    ]
  };

  var INITIAL = {
    adult: ['a-wake', 'a-water', 'a-focus', 'a-exercise', 'a-no-phone'],
    kid: ['k-dress', 'k-brush', 'k-homework', 'k-reading']
  };

  var groups = PRESETS[mode];
  var customs = [];
  var selected = [];

  document.getElementById('modeKicker').textContent = info.emoji + ' ' + info.title;

  function catalog() {
    var map = {};
    groups.forEach(function (g) {
      g.items.forEach(function (item) { map[item.key] = item; });
    });
    customs.forEach(function (item) { map[item.key] = item; });
    return map;
  }

  function makeChip(item, isOn, withX) {
    var el = document.createElement('span');
    el.className = 'chip' + (isOn ? ' chip--on' : '');
    el.dataset.key = item.key;
    var emoji = document.createElement('span');
    emoji.className = 'chip-emoji';
    emoji.textContent = item.emoji;
    el.appendChild(emoji);
    el.appendChild(document.createTextNode(item.name));
    if (withX) {
      var x = document.createElement('span');
      x.className = 'chip-x';
      x.textContent = '×';
      el.appendChild(x);
    }
    return el;
  }

  function isSelected(key) {
    return selected.some(function (item) { return item.key === key; });
  }

  function renderPicked() {
    var box = document.getElementById('pickedChips');
    box.innerHTML = '';
    selected.forEach(function (item) {
      box.appendChild(makeChip(item, true, true));
    });
    document.getElementById('pickedCount').textContent = selected.length;

    var btn = document.getElementById('finishBtn');
    btn.textContent = '完成 · ' + selected.length + ' 项';
    btn.href = 'today.html?mode=' + mode;
    btn.classList.toggle('is-off', selected.length === 0);
  }

  function renderGroups() {
    var wrap = document.getElementById('presetGroups');
    wrap.innerHTML = '';
    groups.forEach(function (group) {
      var section = document.createElement('section');
      section.className = 'group';
      var title = document.createElement('div');
      title.className = 'group-title';
      title.textContent = group.title;
      section.appendChild(title);
      var chips = document.createElement('div');
      chips.className = 'chips';
      group.items.forEach(function (item) {
        chips.appendChild(makeChip(item, isSelected(item.key), false));
      });
      section.appendChild(chips);
      wrap.appendChild(section);
    });
  }

  function renderCustoms() {
    var box = document.getElementById('customChips');
    box.innerHTML = '';
    customs.forEach(function (item) {
      box.appendChild(makeChip(item, isSelected(item.key), false));
    });
  }

  function toggle(key) {
    var map = catalog();
    var item = map[key];
    if (!item) return;
    if (isSelected(key)) {
      selected = selected.filter(function (row) { return row.key !== key; });
    } else {
      selected.push(item);
    }
    renderGroups();
    renderCustoms();
    renderPicked();
  }

  // 初始化已选项
  var map = catalog();
  INITIAL[mode].forEach(function (key) {
    if (map[key]) selected.push(map[key]);
  });

  renderGroups();
  renderCustoms();
  renderPicked();

  document.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (chip) toggle(chip.dataset.key);
  });

  var input = document.getElementById('customInput');
  var addBtn = document.getElementById('customAdd');

  input.addEventListener('input', function () {
    addBtn.classList.toggle('is-off', !input.value.trim());
  });

  function addCustom() {
    var name = input.value.trim();
    if (!name) {
      input.focus();
      return;
    }
    var exist = customs.filter(function (item) { return item.name === name; })[0];
    if (!exist) {
      exist = { key: 'c-' + Date.now(), name: name, emoji: mode === 'kid' ? '🌟' : '⭐' };
      customs.unshift(exist);
    }
    if (!isSelected(exist.key)) selected.push(exist);
    input.value = '';
    addBtn.classList.add('is-off');
    renderCustoms();
    renderGroups();
    renderPicked();
  }

  addBtn.addEventListener('click', addCustom);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addCustom();
  });

  document.getElementById('finishBtn').addEventListener('click', function (e) {
    if (!selected.length) {
      e.preventDefault();
      input.focus();
    }
  });
})();
