import {
  createWidget,
  widget,
  deleteWidget,
  setStatusBarVisible,
  prop,
} from '@zos/ui'
import { Time } from '@zos/sensor'
import { localStorage } from '@zos/storage'

import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  TIME_TEXT,
  STATUS_TEXT,
  PRESET_ROW,
  FINE_ROW,
  START_BUTTON,
  STOP_BUTTON,
} from './index.style'

const STATE_KEY = 'football_timer_state'
const MINUTE = 60 * 1000
const TICK_MS = 100

const BG_COLOR = 0x000000
const TIME_BG_H = 146
const STATUS_TOP = 146
const STATUS_H = 26
const CONTROLS_TOP = 174

const PRESETS = [0, 45]
const FINE_STEPS = [-5, -1, 1, 5]

const DEFAULTS = { running: false, startEpoch: 0, baseMs: 0 }

let sensor = null
try {
  sensor = new Time()
} catch (e) {
  sensor = null
}

function readNow() {
  if (sensor) {
    try {
      const t = sensor.getTime()
      if (typeof t === 'number' && t > 0) return t
    } catch (e) {}
  }
  try {
    return Date.now()
  } catch (e) {
    return 0
  }
}

function pad2(n) {
  return n < 10 ? '0' + n : '' + n
}

function formatTime(ms) {
  let total = Math.floor((ms || 0) / 1000)
  if (!(total > 0)) total = 0
  return pad2(Math.floor(total / 60)) + ':' + pad2(total % 60)
}

function loadState() {
  try {
    return Object.assign({}, DEFAULTS, localStorage.getItem(STATE_KEY, {}))
  } catch (e) {
    return Object.assign({}, DEFAULTS)
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, {
      running: state.running,
      startEpoch: state.startEpoch,
      baseMs: state.baseMs,
    })
  } catch (e) {}
}

function rowStartX(count, width, gap) {
  return Math.round((DEVICE_WIDTH - (count * width + (count - 1) * gap)) / 2)
}

function centeredX(width) {
  return Math.round((DEVICE_WIDTH - width) / 2)
}

function makeButton(x, y, layout, text, onClick) {
  return createWidget(widget.BUTTON, {
    x,
    y,
    w: layout.w,
    h: layout.h,
    radius: layout.radius,
    color: layout.color,
    text_size: layout.text_size,
    normal_color: layout.normal_color,
    press_color: layout.press_color,
    text,
    click_func: onClick,
  })
}

function fillRect(y, h) {
  return createWidget(widget.FILL_RECT, {
    x: 0,
    y,
    w: DEVICE_WIDTH,
    h,
    color: BG_COLOR,
  })
}

Page({
  state: Object.assign({}, DEFAULTS),

  timerId: null,
  bgWidget: null,
  timeBg: null,
  timeWidget: null,
  statusBg: null,
  statusWidget: null,
  shownTime: null,
  shownStatus: null,
  controls: [],

  onInit() {
    Object.assign(this.state, loadState())
  },

  build() {
    try {
      setStatusBarVisible(false)
    } catch (e) {}

    try {
      this.bgWidget = fillRect(0, DEVICE_HEIGHT)
    } catch (e) {}

    this.drawTime(true)
    this.drawStatus(true)
    this.renderControls()
    this.startTicker()
  },

  onShow() {
    this.startTicker()
  },

  onHide() {
    this.stopTicker()
  },

  onDestroy() {
    this.stopTicker()
  },

  statusLabel() {
    return this.state.running ? 'EN MARCHA' : 'PARADO'
  },

  statusColor() {
    return this.state.running ? 0x3fbf6a : 0x8a8f98
  },

  // In-place update first (cheap, no flicker). If the firmware rejects it we
  // repaint an opaque rectangle and redraw the text, because this device does
  // not erase widget pixels on its own.
  drawTime(force) {
    const text = formatTime(this.elapsedMs())
    if (!force && text === this.shownTime) return

    if (!force && this.timeWidget) {
      try {
        this.timeWidget.setProperty(prop.TEXT, text)
        this.shownTime = text
        return
      } catch (e) {}
    }

    if (this.timeWidget) {
      try {
        deleteWidget(this.timeWidget)
      } catch (e) {}
    }
    if (this.timeBg) {
      try {
        deleteWidget(this.timeBg)
      } catch (e) {}
    }

    this.timeBg = fillRect(0, TIME_BG_H)
    this.timeWidget = createWidget(widget.TEXT, Object.assign({}, TIME_TEXT, { text }))
    this.shownTime = text
  },

  drawStatus(force) {
    const text = this.statusLabel()
    if (!force && text === this.shownStatus) return

    if (this.statusWidget) {
      try {
        deleteWidget(this.statusWidget)
      } catch (e) {}
    }
    if (this.statusBg) {
      try {
        deleteWidget(this.statusBg)
      } catch (e) {}
    }

    this.statusBg = fillRect(STATUS_TOP, STATUS_H)
    this.statusWidget = createWidget(
      widget.TEXT,
      Object.assign({}, STATUS_TEXT, { text, color: this.statusColor() }),
    )
    this.shownStatus = text
  },

  tick() {
    this.drawTime(false)
  },

  track(widgetRef) {
    this.controls.push(widgetRef)
    return widgetRef
  },

  clearControls() {
    this.controls.forEach((w) => {
      try {
        deleteWidget(w)
      } catch (e) {}
    })
    this.controls = []
  },

  renderControls() {
    this.clearControls()

    // Erase the previous controls before drawing the new set.
    this.controls.push(fillRect(CONTROLS_TOP, DEVICE_HEIGHT - CONTROLS_TOP))

    if (this.state.running) {
      this.track(
        makeButton(
          centeredX(STOP_BUTTON.w),
          STOP_BUTTON.y,
          STOP_BUTTON,
          STOP_BUTTON.text,
          () => this.toggle(),
        ),
      )
      return
    }

    const presetX = rowStartX(PRESETS.length, PRESET_ROW.w, PRESET_ROW.gap)
    PRESETS.forEach((minute, index) => {
      this.track(
        makeButton(
          presetX + index * (PRESET_ROW.w + PRESET_ROW.gap),
          PRESET_ROW.y,
          PRESET_ROW,
          '' + minute,
          () => this.setBase(minute),
        ),
      )
    })

    const fineX = rowStartX(FINE_STEPS.length, FINE_ROW.w, FINE_ROW.gap)
    FINE_STEPS.forEach((step, index) => {
      this.track(
        makeButton(
          fineX + index * (FINE_ROW.w + FINE_ROW.gap),
          FINE_ROW.y,
          FINE_ROW,
          step > 0 ? '+' + step : '' + step,
          () => this.adjust(step),
        ),
      )
    })

    this.track(
      makeButton(
        centeredX(START_BUTTON.w),
        START_BUTTON.y,
        START_BUTTON,
        START_BUTTON.text,
        () => this.toggle(),
      ),
    )
  },

  startTicker() {
    if (this.timerId) return
    this.timerId = setInterval(() => {
      try {
        this.tick()
      } catch (e) {}
    }, TICK_MS)
  },

  stopTicker() {
    if (this.timerId) {
      try {
        clearInterval(this.timerId)
      } catch (e) {}
      this.timerId = null
    }
  },

  elapsedMs() {
    const { running, startEpoch, baseMs } = this.state
    if (running && startEpoch) {
      return baseMs + (readNow() - startEpoch)
    }
    return baseMs
  },

  toggle() {
    const t = readNow()
    if (this.state.running) {
      this.state.baseMs += t - this.state.startEpoch
      this.state.running = false
      this.state.startEpoch = 0
    } else {
      this.state.running = true
      this.state.startEpoch = t
    }
    saveState(this.state)
    this.renderControls()
    this.drawStatus(true)
    this.drawTime(true)
  },

  setBase(minutes) {
    if (this.state.running) return
    this.state.baseMs = Math.max(0, minutes) * MINUTE
    saveState(this.state)
    this.drawTime(true)
  },

  adjust(minutes) {
    if (this.state.running) return
    this.state.baseMs = Math.max(0, this.state.baseMs + minutes * MINUTE)
    saveState(this.state)
    this.drawTime(true)
  },
})
