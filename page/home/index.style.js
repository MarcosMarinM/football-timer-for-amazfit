import { align } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'

export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

export const TIME_TEXT = {
  x: 0,
  y: 4,
  w: DEVICE_WIDTH,
  h: 142,
  color: 0xffffff,
  text_size: 88,
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text: '00:00',
}

export const STATUS_TEXT = {
  x: 0,
  y: 146,
  w: DEVICE_WIDTH,
  h: 26,
  color: 0x8a8f98,
  text_size: 20,
  align_h: align.CENTER_H,
  align_v: align.CENTER_V,
  text: 'PARADO',
}

export const PRESET_ROW = {
  y: 180,
  w: 140,
  h: 70,
  gap: 12,
  radius: 35,
  color: 0xffffff,
  text_size: 38,
  normal_color: 0x1f5fa8,
  press_color: 0x2f7fd0,
}

export const FINE_ROW = {
  y: 258,
  w: 62,
  h: 42,
  gap: 8,
  radius: 21,
  color: 0x9aa0a6,
  text_size: 20,
  normal_color: 0x24272b,
  press_color: 0x3a3f45,
}

export const START_BUTTON = {
  y: 308,
  w: 252,
  h: 66,
  radius: 33,
  color: 0xffffff,
  text_size: 34,
  normal_color: 0x1f7a35,
  press_color: 0x2ea14a,
  text: 'INICIAR',
}

export const STOP_BUTTON = {
  y: 210,
  w: 252,
  h: 84,
  radius: 42,
  color: 0xffffff,
  text_size: 36,
  normal_color: 0xb0332a,
  press_color: 0xd2453a,
  text: 'PARAR',
}
