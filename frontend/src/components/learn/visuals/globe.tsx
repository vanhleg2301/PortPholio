import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VisualCard } from './Player'

interface City {
  name: string
  lat: number
  lon: number
}

const CITIES: City[] = [
  { name: 'Hanoi', lat: 21.03, lon: 105.85 },
  { name: 'Ho Chi Minh City', lat: 10.82, lon: 106.63 },
  { name: 'Singapore', lat: 1.35, lon: 103.82 },
  { name: 'Tokyo', lat: 35.68, lon: 139.69 },
  { name: 'Sydney', lat: -33.87, lon: 151.21 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88 },
  { name: 'Frankfurt', lat: 50.11, lon: 8.68 },
  { name: 'London', lat: 51.51, lon: -0.13 },
  { name: 'N. Virginia (us-east-1)', lat: 38.95, lon: -77.45 },
  { name: 'California (us-west-1)', lat: 37.35, lon: -121.96 },
  { name: 'São Paulo', lat: -23.55, lon: -46.63 },
]

const EARTH_RADIUS_KM = 6371
const FIBRE_KM_PER_MS = 200
const RADIUS = 1

function toVector(lat: number, lon: number, radius = RADIUS): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon + 180)
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta))
}

// Great-circle distance (haversine).
function distanceKm(a: City, b: City): number {
  const toRad = THREE.MathUtils.degToRad
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

// Points on the great circle between a and b, lifted into an arc.
function arcPoints(a: THREE.Vector3, b: THREE.Vector3, segments = 96): THREE.Vector3[] {
  const start = a.clone().normalize()
  const end = b.clone().normalize()
  const angle = start.angleTo(end)
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const point =
      angle < 1e-6
        ? start.clone()
        : start
            .clone()
            .multiplyScalar(Math.sin((1 - t) * angle) / Math.sin(angle))
            .add(end.clone().multiplyScalar(Math.sin(t * angle) / Math.sin(angle)))
    points.push(point.multiplyScalar(RADIUS * (1 + 0.25 * (angle / Math.PI) * Math.sin(Math.PI * t))))
  }
  return points
}

function graticule(): THREE.Group {
  const group = new THREE.Group()
  const material = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.18 })
  for (let lat = -60; lat <= 60; lat += 30) {
    const points = Array.from({ length: 73 }, (_, i) => toVector(lat, i * 5 - 180, RADIUS * 1.001))
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material))
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const points = Array.from({ length: 37 }, (_, i) => toVector(i * 5 - 90, lon, RADIUS * 1.001))
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material))
  }
  return group
}

// 3D globe: pick two cities and see the shortest path light can take, with the minimum
// round-trip time that no software can beat.
export default function GlobeVisual({ caption }: { caption?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const routeRef = useRef<{ from: number; to: number }>({ from: 0, to: 9 })
  const rebuildRouteRef = useRef<(() => void) | null>(null)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(9)

  const km = distanceKm(CITIES[from], CITIES[to])
  const oneWayMs = km / FIBRE_KM_PER_MS
  const rttMs = 2 * oneWayMs

  useEffect(() => {
    routeRef.current = { from, to }
    rebuildRouteRef.current?.()
  }, [from, to])

  useEffect(() => {
    const host = hostRef.current
    const labelHost = labelsRef.current
    if (!host || !labelHost) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    host.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'pan-y'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0.6, 3.4)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.rotateSpeed = 0.6
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Where the camera is flying to (the middle of the chosen route); null once it has arrived.
    let focusTarget: THREE.Vector3 | null = null
    controls.addEventListener('start', () => (focusTarget = null))

    const globe = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 64, 64), new THREE.MeshBasicMaterial({ color: 0x0b1730 }))
    scene.add(globe)
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.08, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.08, side: THREE.BackSide })
    )
    scene.add(atmosphere)
    const grid = graticule()
    scene.add(grid)

    const cityGroup = new THREE.Group()
    const dotGeometry = new THREE.SphereGeometry(0.018, 12, 12)
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    const activeMaterial = new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    const dots = CITIES.map((city) => {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial)
      dot.position.copy(toVector(city.lat, city.lon, RADIUS * 1.005))
      cityGroup.add(dot)
      return dot
    })
    scene.add(cityGroup)

    const labels = CITIES.map((city) => {
      const el = document.createElement('span')
      el.textContent = city.name
      el.className = 'pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white transition-opacity'
      labelHost.appendChild(el)
      return el
    })

    const arcMaterial = new THREE.LineBasicMaterial({ color: 0xfbbf24 })
    let arc: THREE.Line | null = null
    let arcPath: THREE.Vector3[] = []
    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfde68a }))
    scene.add(packet)

    const rebuildRoute = () => {
      const { from: a, to: b } = routeRef.current
      dots.forEach((dot, i) => (dot.material = i === a || i === b ? activeMaterial : dotMaterial))
      if (arc) {
        scene.remove(arc)
        arc.geometry.dispose()
      }
      arcPath = arcPoints(toVector(CITIES[a].lat, CITIES[a].lon), toVector(CITIES[b].lat, CITIES[b].lon))
      arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPath), arcMaterial)
      scene.add(arc)
      // Turn the globe so the whole route faces the viewer.
      const middle = arcPath[Math.floor(arcPath.length / 2)].clone().normalize()
      const target = middle.add(new THREE.Vector3(0, 0.25, 0)).normalize().multiplyScalar(camera.position.length())
      if (prefersReducedMotion) camera.position.copy(target)
      else focusTarget = target
    }
    rebuildRouteRef.current = rebuildRoute
    rebuildRoute()
    if (focusTarget) {
      camera.position.copy(focusTarget)
      focusTarget = null
    }

    const resize = () => {
      const width = host.clientWidth
      const height = host.clientHeight
      renderer.setSize(width, height, false)
      renderer.domElement.style.width = `${width}px`
      renderer.domElement.style.height = `${height}px`
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    // Only draw while the globe is on screen.
    let isVisible = true
    const visibility = new IntersectionObserver(([entry]) => (isVisible = entry.isIntersecting))
    visibility.observe(host)

    const projected = new THREE.Vector3()
    const toCamera = new THREE.Vector3()
    let frame = 0
    const startedAt = performance.now()
    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!isVisible) return
      if (focusTarget) {
        const length = camera.position.length()
        camera.position.lerp(focusTarget, 0.08).setLength(length)
        if (camera.position.distanceTo(focusTarget) < 0.01) focusTarget = null
      }
      controls.update()

      // The packet goes there and back; slowed down so a 60 ms trip is visible.
      if (arcPath.length > 1) {
        const { from: a, to: b } = routeRef.current
        const tripMs = Math.max(distanceKm(CITIES[a], CITIES[b]) / FIBRE_KM_PER_MS, 1)
        const cycle = Math.min(Math.max(tripMs * 2 * 30, 1200), 6000)
        const phase = ((performance.now() - startedAt) % cycle) / cycle
        const t = phase < 0.5 ? phase * 2 : 2 - phase * 2
        packet.position.copy(arcPath[Math.round(t * (arcPath.length - 1))])
      }

      const width = host.clientWidth
      const height = host.clientHeight
      CITIES.forEach((_, i) => {
        const position = dots[i].position
        toCamera.copy(camera.position).sub(position)
        const isFacing = position.clone().normalize().dot(toCamera.normalize()) > 0.15
        projected.copy(position).project(camera)
        const x = (projected.x * 0.5 + 0.5) * width
        const y = (-projected.y * 0.5 + 0.5) * height
        const isActive = i === routeRef.current.from || i === routeRef.current.to
        // Keep labels inside the card: flip a label to the left of its dot near the right edge.
        const labelWidth = labels[i].offsetWidth
        const left = x + 6 + labelWidth > width ? x - 6 - labelWidth : x + 6
        labels[i].style.transform = `translate(${left}px, ${y - 8}px)`
        labels[i].style.opacity = isFacing ? (isActive ? '1' : '0.55') : '0'
        labels[i].style.background = isActive ? 'rgba(217,119,6,0.85)' : ''
      })
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      controls.dispose()
      labels.forEach((el) => el.remove())
      rebuildRouteRef.current = null
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((m: THREE.Material) => m.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  const select = (value: number, onChange: (v: number) => void, label: string) => (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-foreground/40"
      >
        {CITIES.map((c, i) => (
          <option key={c.name} value={i}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <VisualCard
      title="Distance and the speed of light"
      caption={caption}
      inputs={
        <>
          {select(from, setFrom, 'from')}
          {select(to, setTo, 'to')}
        </>
      }
      note={
        <>
          {CITIES[from].name} → {CITIES[to].name}: about <b>{Math.round(km).toLocaleString('en')} km</b> in a straight line over the Earth. Light in fibre needs at least{' '}
          <b>{Math.round(oneWayMs)} ms</b> one way, so one round trip is at least <b>{Math.round(rttMs)} ms</b>, and a new HTTPS request (3 round trips) at least{' '}
          <b>{Math.round(rttMs * 3)} ms</b>. Real cables are not straight, so real numbers are often 1.5–2× higher.
        </>
      }
    >
      <div className="relative mx-auto aspect-square w-full max-w-sm cursor-grab active:cursor-grabbing">
        <div ref={hostRef} className="absolute inset-0" />
        <div ref={labelsRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
      </div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">Drag to turn the globe; it turns to face the route you pick. The yellow dot is one packet going there and back (slowed down).</p>
    </VisualCard>
  )
}
