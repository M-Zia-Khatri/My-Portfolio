import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function BgScene() {
  const svgRef = useRef(null)
  const linesRef = useRef([])
  const sizeRef = useRef({ w: 0, h: 0 })
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const smoothMouseRef = useRef({ x: -9999, y: -9999 })
  const rectCacheRef = useRef(null)

  useEffect(() => {
    let animation = null

    const init = () => {
      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (!w || !h) { requestAnimationFrame(init); return }

      sizeRef.current = { w, h }
      rectCacheRef.current = rect

      while (svg.firstChild) svg.removeChild(svg.firstChild)
      linesRef.current = []
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`)

      const count = Math.ceil(w / 10) // one line every 10 pixels horizontally — adjust as needed based on desired density and performance. Note that the number of lines has a bigger impact on performance than the number of segments per line, so it's often better to have fewer lines with more segments than many lines with fewer segments.
      const SEGMENTS = 160 // number of segments per line — more is smoother but slower, fewer is more jagged but faster. 160 is a good sweet spot for 60fps on most devices, and looks good up to ~4k resolution. Adjust as needed! Note that the performance optimization of pre-allocating the parts array and pre-computing Y values becomes more significant as you increase segments, so you can get away with higher segment counts without as much of a performance hit.

      // Pre-allocate reusable parts array — avoids per-frame array creation
      const parts = new Array(SEGMENTS + 1)

      // Pre-compute Y positions once — they never change
      const yValues = new Float32Array(SEGMENTS + 1)
      for (let s = 0; s <= SEGMENTS; s++) {
        yValues[s] = (s / SEGMENTS) * h
      }

      for (let i = 0; i < count; i++) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        path.setAttribute("stroke", "#76c7eb")
        path.setAttribute("stroke-width", "1")
        path.setAttribute("opacity", "0.5")
        path.setAttribute("fill", "none")
        svg.appendChild(path)
        linesRef.current[i] = path
      }


      const baseXValues = new Float32Array(count)
      for (let i = 0; i < count; i++) baseXValues[i] = i * 10.5

      const amplitude = 20 // wave amplitude in pixels
      const frequency = 0.2 // wave frequency — higher is more waves
      const mouseRadius = 40 // radius of mouse influence in pixels
      const mouseRadiusSq = (mouseRadius ** 2)  // avoid sqrt when outside radius
      const carveStrength = 0.95 // how much the mouse "carves" into the wave — higher is more extreme deformation
      const pushDist = mouseRadius * carveStrength // max distance to push points when mouse is at center of influence
      const lerpFactor = 0.3 // how quickly the smoothed mouse position catches up to the real mouse — lower is slower/smoother, higher is more responsive
      const state = { t: 0 } // animation state

      animation = gsap.to(state, {
        t: Math.PI * 2,
        duration: 6,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          const lines = linesRef.current
          const height = sizeRef.current.h
          const t = state.t

          // Lerp smooth mouse
          smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * lerpFactor
          smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * lerpFactor

          const mx = smoothMouseRef.current.x
          const my = smoothMouseRef.current.y
          const isActive = mouseRef.current.x !== -9999

          for (let i = 0; i < lines.length; i++) {
            const baseX = baseXValues[i] + Math.sin(t + i * frequency) * amplitude
            const dx0 = baseX - mx

            // Broad-phase: if line's baseX is outside radius horizontally, skip all
            // per-segment distance math entirely — just draw straight
            const lineNearMouse = isActive && Math.abs(dx0) < mouseRadius

            if (!lineNearMouse) {
              // Fast path: no mouse influence — single straight line, no loop needed
              // Use integer rounding (~~) instead of toFixed — ~10x faster
              parts[0] = `M${~~baseX} 0`
              parts[1] = `L${~~baseX} ${~~height}`
              lines[i].setAttribute("d", parts[0] + " " + parts[1])
              continue
            }

            // Slow path: near mouse, compute per-segment deflection
            for (let s = 0; s <= SEGMENTS; s++) {
              const y = yValues[s]
              let x = baseX

              const dx = baseX - mx
              const dy = y - my
              const distSq = dx * dx + dy * dy

              // Use squared distance to avoid sqrt on segments outside radius
              if (distSq < mouseRadiusSq) {
                const dist = Math.sqrt(distSq) // sqrt only when needed
                const angle = Math.atan2(dy, dx)
                const blend = 1 - dist / mouseRadius
                const smooth = blend * blend * (3 - 2 * blend)
                x = mx + Math.cos(angle) * (dist + (pushDist - dist) * smooth)
              }

              // ~~ (double bitwise NOT) truncates to int — much faster than toFixed
              parts[s] = s === 0 ? `M${~~x} ${~~y}` : `L${~~x} ${~~y}`
            }

            lines[i].setAttribute("d", parts.join(" "))
          }
        },
      })

      // Cache bounding rect — recalculate only on resize, not every mousemove
      const handleMouseMove = (e) => {
        const r = rectCacheRef.current
        mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
      }
      const handleMouseLeave = () => {
        mouseRef.current = { x: -9999, y: -9999 }
      }
      const handleResize = () => {
        rectCacheRef.current = svgRef.current?.getBoundingClientRect() ?? rectCacheRef.current
        sizeRef.current = { w: rectCacheRef.current.width, h: rectCacheRef.current.height }
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseleave", handleMouseLeave)
      window.addEventListener("resize", handleResize)

      svg._cleanup = () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseleave", handleMouseLeave)
        window.removeEventListener("resize", handleResize)
        if (animation) animation.kill()
      }
    }

    requestAnimationFrame(init)
    return () => { svgRef.current?._cleanup?.() }
  }, [])

  return (
    <div className="w-[101svw] h-dvh fixed left-1/2 -translate-1/2 inset-0 top-1/2 z-0">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}