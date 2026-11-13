(function () {
  var P = window.Proto;
  var mode = P.mode;

  Array.prototype.forEach.call(document.querySelectorAll('#modeSeg .seg-item'), function (el) {
    var isKid = (el.getAttribute('href') || '').indexOf('kid') >= 0;
    el.classList.toggle('is-on', (mode === 'kid') === isKid);
  });

  var view = 'week';
  var weekOffset = 0;
  var monthOffset = 0;

  var today = new Date();
  var todayKey = P.dateKey(today);

  function hash(str) {
    var h = 7;
    for (var i = 0; i < str.length; i += 1) {
      h = (h * 31 + str.charCodeAt(i)) % 100003;
    }
    return h;
  }

  // 稳定的假数据：同一天同一模式每次打开结果一致
  function planFor(key) {
    if (key === todayKey) {
      return mode === 'kid' ? { total: 4, done: 1 } : { total: 5, done: 2 };
    }
    var h = hash(key + '|' + mode);
    if (h % 8 === 0) return { total: 0, done: 0 };
    var total = 3 + (h % 4);
    var done = h % (total + 1);
    return { total: total, done: done };
  }

  function buildDays() {
    var arr = [];
    var i;
    if (view === 'week') {
      var start = P.addDays(P.startOfWeek(today), weekOffset * 7);
      for (i = 0; i < 7; i += 1) arr.push(P.addDays(start, i));
      return arr;
    }
    var first = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    var lastDate = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (i = 1; i <= lastDate; i += 1) {
      arr.push(new Date(first.getFullYear(), first.getMonth(), i));
    }
    return arr;
  }

  function rangeLabel(days) {
    var first = days[0];
    var last = days[days.length - 1];
    if (view === 'month') {
      return first.getFullYear() + '年' + (first.getMonth() + 1) + '月';
    }
    var sameMonth = first.getMonth() === last.getMonth();
    var body = sameMonth
      ? (first.getMonth() + 1) + '月' + first.getDate() + '日 - ' + last.getDate() + '日'
      : (first.getMonth() + 1) + '月' + first.getDate() + '日 - ' + (last.getMonth() + 1) + '月' + last.getDate() + '日';
    return first.getFullYear() === today.getFullYear() ? body : first.getFullYear() + '年' + body;
  }

  function render() {
    var days = buildDays();
    var data = days.map(function (day) {
      var key = P.dateKey(day);
      var plan = planFor(key);
      return {
        day: day,
        key: key,
        total: plan.total,
        done: plan.done,
        undone: Math.max(0, plan.total - plan.done),
        isToday: key === todayKey
      };
    });

    var maxTotal = 0;
    data.forEach(function (row) {
      if (row.total > maxTotal) maxTotal = row.total;
    });
    var axisMax = Math.max(maxTotal, 1);
    var scale = 150 / axisMax;

    var cols = document.getElementById('cols');
    var plot = document.getElementById('plot');
    cols.innerHTML = '';
    plot.classList.toggle('is-month', view === 'month');

    var doneSum = 0;
    var totalSum = 0;
    var daysCount = 0;

    data.forEach(function (row) {
      if (row.total > 0) {
        doneSum += row.done;
        totalSum += row.total;
        daysCount += 1;
      }

      var doneH = row.done ? Math.max(3, Math.round(row.done * scale)) : 0;
      var undoneH = row.undone ? Math.max(3, Math.round(row.undone * scale)) : 0;
      if (doneH + undoneH > 150) undoneH = 150 - doneH;

      var col = document.createElement('div');
      col.className = 'col' + (row.isToday ? ' is-today' : '');

      var barWrap = document.createElement('div');
      barWrap.className = 'bar-wrap';

      if (row.total > 0) {
        var bar = document.createElement('div');
        bar.className = 'bar';
        if (undoneH > 0) {
          var undone = document.createElement('div');
          undone.className = 'bar-undone';
          undone.style.height = undoneH + 'px';
          bar.appendChild(undone);
        }
        if (doneH > 0) {
          var done = document.createElement('div');
          done.className = 'bar-done';
          done.style.height = doneH + 'px';
          bar.appendChild(done);
        }
        barWrap.appendChild(bar);
      } else {
        var none = document.createElement('div');
        none.className = 'bar-none';
        barWrap.appendChild(none);
      }

      var dateLabel = document.createElement('div');
      dateLabel.className = 'col-date';
      dateLabel.textContent = view === 'week'
        ? (row.day.getMonth() + 1) + '/' + row.day.getDate()
        : String(row.day.getDate());

      var weekLabel = document.createElement('div');
      weekLabel.className = 'col-week';
      weekLabel.textContent = view === 'week'
        ? P.weekdayCN(row.day)
        : P.weekdayCN(row.day).replace('周', '');

      col.appendChild(barWrap);
      col.appendChild(dateLabel);
      col.appendChild(weekLabel);
      cols.appendChild(col);
    });

    document.getElementById('rangeLabel').textContent = rangeLabel(days);

    var mid = axisMax / 2;
    document.getElementById('yAxis').innerHTML =
      '<span>' + axisMax + '</span><span>' + (mid % 1 === 0 ? mid : mid.toFixed(1)) + '</span><span>0</span>';

    document.getElementById('sumDone').textContent = doneSum;
    document.getElementById('sumRate').textContent =
      (totalSum ? Math.round((doneSum / totalSum) * 100) : 0) + '%';
    document.getElementById('sumDays').textContent = daysCount;
    document.getElementById('chartEmpty').hidden = totalSum > 0;

    var offset = view === 'week' ? weekOffset : monthOffset;
    document.getElementById('nextBtn').disabled = offset >= 0;
    document.getElementById('prevBtn').disabled = offset <= -12;

    if (view === 'month' && monthOffset === 0) {
      var box = document.querySelector('.plot-scroll');
      var target = cols.querySelector('.is-today');
      if (box && target) {
        setTimeout(function () {
          box.scrollLeft = Math.max(0, target.offsetLeft - box.clientWidth / 2);
        }, 20);
      }
    } else {
      var scroller = document.querySelector('.plot-scroll');
      if (scroller) scroller.scrollLeft = 0;
    }
  }

  document.getElementById('viewSeg').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-view]');
    if (!btn) return;
    view = btn.dataset.view;
    weekOffset = 0;
    monthOffset = 0;
    Array.prototype.forEach.call(document.querySelectorAll('#viewSeg .seg-item'), function (el) {
      el.classList.toggle('is-on', el.dataset.view === view);
    });
    render();
  });

  document.getElementById('prevBtn').addEventListener('click', function () {
    if (view === 'week') {
      if (weekOffset <= -12) return;
      weekOffset -= 1;
    } else {
      if (monthOffset <= -12) return;
      monthOffset -= 1;
    }
    render();
  });

  document.getElementById('nextBtn').addEventListener('click', function () {
    if (view === 'week') {
      if (weekOffset >= 0) return;
      weekOffset += 1;
    } else {
      if (monthOffset >= 0) return;
      monthOffset += 1;
    }
    render();
  });

  render();
})();
