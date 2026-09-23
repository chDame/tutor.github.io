import { useEffect, useRef } from 'react'

/**
 * Canvas fireworks using the classic technique: instead of clearing the
 * canvas each frame, paint a low-alpha black rect over it so previous frames
 * fade out gradually (comet tails), and draw shots/particles with additive
 * ("lighter") blending for the glow. This only reads correctly on a dark
 * canvas, so the canvas itself is a contained dark panel rather than
 * transparent over the light card.
 */

const PALETTE = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff924c']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  radius: number
}

interface Shot {
  x: number
  y: number
  vy: number
  targetY: number
  color: string
}

const PARTICLE_GRAVITY = 90 // px/s^2, applied to explosion sparks
const PARTICLE_DRAG = 0.985
const SHOT_GRAVITY = 260 // px/s^2, decelerates the rising shot until it "explodes"
const SHOT_RADIUS = 3
const SHOT_GLOW = 16
const FADE_ALPHA = 0.22

function spawnBurst(particles: Particle[], x: number, y: number, color: string) {
  const count = 36 + Math.floor(Math.random() * 20)
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
    const speed = 60 + Math.random() * 100
    const maxLife = 0.8 + Math.random() * 0.6
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: maxLife,
      maxLife,
      color,
      radius: 2 + Math.random() * 1.5,
    })
  }
}

function spawnShot(shots: Shot[], width: number, height: number) {
  shots.push({
    x: width * (0.2 + Math.random() * 0.6),
    y: height,
    vy: -(190 + Math.random() * 50),
    targetY: height * (0.15 + Math.random() * 0.25),
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  })
}

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)
    }
    resize()

    const shots: Shot[] = []
    const particles: Particle[] = []
    let nextShotAt = 0
    let elapsed = 0
    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt

      const { width, height } = canvas.getBoundingClientRect()

      if (elapsed >= nextShotAt) {
        spawnShot(shots, width, height)
        nextShotAt = elapsed + 0.6 + Math.random() * 0.5
      }

      // fade previous frame instead of clearing, for comet-tail trails
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`
      ctx.fillRect(0, 0, width, height)

      ctx.globalCompositeOperation = 'lighter'

      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i]
        s.vy += SHOT_GRAVITY * dt
        s.y += s.vy * dt

        if (s.y <= s.targetY || s.vy >= 0) {
          spawnBurst(particles, s.x, s.y, s.color)
          shots.splice(i, 1)
          continue
        }

        ctx.shadowColor = s.color
        ctx.shadowBlur = SHOT_GLOW
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, SHOT_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life -= dt
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        p.vy += PARTICLE_GRAVITY * dt
        p.vx *= PARTICLE_DRAG
        p.vy *= PARTICLE_DRAG
        p.x += p.vx * dt
        p.y += p.vy * dt

        ctx.globalAlpha = Math.min(1, p.life / p.maxLife)
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      ctx.globalCompositeOperation = 'source-over'

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fireworks-canvas" />
}
