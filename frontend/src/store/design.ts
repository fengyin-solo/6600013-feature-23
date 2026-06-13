import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DesignParams, PatternType } from '../types'
import { THEMES } from '../themes/palettes'

interface DesignStore extends DesignParams {
  themeId: string
  svgContent: string
  setParam: <K extends keyof DesignParams>(key: K, value: DesignParams[K]) => void
  setPattern: (p: PatternType) => void
  setTheme: (id: string) => void
  setPaletteColor: (index: number, color: string) => void
  resetPalette: () => void
  randomSeed: () => void
  setSvgContent: (s: string) => void
  exportSvg: () => void
  exportPng: () => void
}

export const useDesignStore = create<DesignStore>()(
  persist(
    (set, get) => ({
      themeId: THEMES[0].id,
      pattern: 'spiral',
      seed: 42,
      iterations: 200,
      scale: 1.0,
      rotation: 0,
      strokeWidth: 1.5,
      opacity: 0.8,
      bgColor: '#030712',
      palette: THEMES[0].colors,
      width: 800,
      height: 1000,
      svgContent: '',
      setParam: (key, value) => set({ [key]: value } as any),
      setPattern: (p) => set({ pattern: p }),
      setTheme: (id) => {
        const theme = THEMES.find(t => t.id === id)
        if (theme) set({ themeId: id, palette: [...theme.colors] })
      },
      setPaletteColor: (index, color) => {
        const palette = [...get().palette]
        if (index >= 0 && index < palette.length) {
          palette[index] = color
          set({ palette })
        }
      },
      resetPalette: () => {
        const theme = THEMES.find(t => t.id === get().themeId)
        if (theme) set({ palette: [...theme.colors] })
      },
      randomSeed: () => set({ seed: Math.floor(Math.random() * 99999) }),
      setSvgContent: (s) => set({ svgContent: s }),
      exportSvg: () => {
        const { svgContent } = get()
        const blob = new Blob([svgContent], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `art-${get().seed}.svg`; a.click()
        URL.revokeObjectURL(url)
      },
      exportPng: () => {
        const { svgContent, width, height } = get()
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')!
        const img = new Image()
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(svgBlob)
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(url)
          canvas.toBlob(blob => {
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob!)
            a.download = `art-${get().seed}.png`; a.click()
          })
        }
        img.src = url
      },
    }),
    {
      name: 'design-store',
      partialize: (state) => ({
        themeId: state.themeId,
        palette: state.palette,
        bgColor: state.bgColor,
        pattern: state.pattern,
        seed: state.seed,
        iterations: state.iterations,
        scale: state.scale,
        rotation: state.rotation,
        strokeWidth: state.strokeWidth,
        opacity: state.opacity,
      }),
    }
  )
)
