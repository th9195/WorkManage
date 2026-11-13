const MODES = {
  adult: {
    key: 'adult',
    title: '我的小闯关',
    subtitle: '给今天的自己，安排几件想做好的事',
    emoji: '🌅',
    motto: '今天也为自己闯一关'
  },
  kid: {
    key: 'kid',
    title: '宝贝打卡站',
    subtitle: '每完成一件事，就点亮一颗小星星',
    emoji: '🧸',
    motto: '今天要打卡几件事呢'
  }
}

const PRESET_GROUPS = {
  adult: [
    {
      title: '早晨',
      items: [
        { key: 'a-wake', name: '按时起床', emoji: '⏰' },
        { key: 'a-water', name: '喝一杯温水', emoji: '💧' },
        { key: 'a-plan', name: '列出今日三件事', emoji: '📝' }
      ]
    },
    {
      title: '白天',
      items: [
        { key: 'a-focus', name: '专注工作 2 小时', emoji: '🎯' },
        { key: 'a-exercise', name: '运动 30 分钟', emoji: '🏃' },
        { key: 'a-reading', name: '阅读 20 分钟', emoji: '📖' },
        { key: 'a-walk', name: '饭后散步', emoji: '🚶' }
      ]
    },
    {
      title: '晚上',
      items: [
        { key: 'a-review', name: '复盘今天', emoji: '🪞' },
        { key: 'a-no-phone', name: '睡前不刷手机', emoji: '📵' },
        { key: 'a-sleep', name: '23 点前入睡', emoji: '🌙' }
      ]
    }
  ],
  kid: [
    {
      title: '自己的事',
      items: [
        { key: 'k-dress', name: '自己穿衣', emoji: '👕' },
        { key: 'k-brush', name: '认真刷牙', emoji: '🪥' },
        { key: 'k-tidy', name: '整理书包', emoji: '🎒' }
      ]
    },
    {
      title: '学习',
      items: [
        { key: 'k-homework', name: '完成作业', emoji: '✏️' },
        { key: 'k-reading', name: '阅读 20 分钟', emoji: '📚' },
        { key: 'k-handwriting', name: '练字 15 分钟', emoji: '🖊️' }
      ]
    },
    {
      title: '生活',
      items: [
        { key: 'k-chore', name: '做一件家务', emoji: '🧹' },
        { key: 'k-outdoor', name: '户外活动 1 小时', emoji: '⚽' },
        { key: 'k-sleep', name: '21 点前睡觉', emoji: '🛌' }
      ]
    }
  ]
}

module.exports = {
  MODES,
  PRESET_GROUPS
}
