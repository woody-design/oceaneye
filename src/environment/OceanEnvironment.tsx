import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DepthTheme } from '../depth/depthTheme'
import type { ZoneId } from '../types/creature'

type OceanEnvironmentProps = {
  theme: DepthTheme
  transparentBackground?: boolean
  showParticles?: boolean
  showStageIons?: boolean
}

type StageIonConfig = {
  count: number
  color: string
  opacity: number
  radiusMin: number
  radiusMax: number
  depthMin: number
  depthMax: number
  sizeMin: number
  sizeMax: number
  drift: number
}

type StageIonParticle = {
  x: number
  y: number
  z: number
  size: number
  phase: number
  speed: number
  driftX: number
  driftY: number
  driftZ: number
}

const STAGE_ION_CONFIGS: Partial<Record<ZoneId, StageIonConfig>> = {
  sunlight: {
    count: 17,
    color: '#f2ffff',
    opacity: 0.2,
    radiusMin: 0.85,
    radiusMax: 2.65,
    depthMin: 0.9,
    depthMax: -2.9,
    sizeMin: 0.0055,
    sizeMax: 0.0095,
    drift: 0.12,
  },
  twilight: {
    count: 17,
    color: '#f2ffff',
    opacity: 0.2,
    radiusMin: 0.85,
    radiusMax: 2.65,
    depthMin: 0.9,
    depthMax: -2.9,
    sizeMin: 0.0055,
    sizeMax: 0.0095,
    drift: 0.12,
  },
  midnight: {
    count: 17,
    color: '#f2ffff',
    opacity: 0.2,
    radiusMin: 0.85,
    radiusMax: 2.65,
    depthMin: 0.9,
    depthMax: -2.9,
    sizeMin: 0.0055,
    sizeMax: 0.0095,
    drift: 0.12,
  },
  abyssal: {
    count: 17,
    color: '#f2ffff',
    opacity: 0.2,
    radiusMin: 0.85,
    radiusMax: 2.65,
    depthMin: 0.9,
    depthMax: -2.9,
    sizeMin: 0.0055,
    sizeMax: 0.0095,
    drift: 0.12,
  },
  hadal: {
    count: 17,
    color: '#f2ffff',
    opacity: 0.2,
    radiusMin: 0.85,
    radiusMax: 2.65,
    depthMin: 0.9,
    depthMax: -2.9,
    sizeMin: 0.0055,
    sizeMax: 0.0095,
    drift: 0.12,
  },
}

export function OceanEnvironment({
  theme,
  transparentBackground = false,
  showParticles = true,
  showStageIons = false,
}: OceanEnvironmentProps) {
  return (
    <>
      {transparentBackground ? null : <color attach="background" args={[theme.waterColor]} />}
      <fog attach="fog" args={[theme.fogColor, 5, 15]} />
      <ambientLight intensity={theme.ambientLight} />
      <directionalLight position={[2.8, 5.5, 3.2]} intensity={theme.keyLight} color="#f7fffb" />
      <pointLight position={[-2.4, 0.8, 2.6]} intensity={theme.bioluminescenceDensity > 0 ? 0.35 : 0.12} color={theme.accent} />
      {showParticles ? <ParticleField theme={theme} /> : null}
      {showStageIons ? <StageIonField theme={theme} /> : null}
    </>
  )
}

function StageIonField({ theme }: OceanEnvironmentProps) {
  const config = STAGE_ION_CONFIGS[theme.id]
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const instanceObjectRef = useRef(new THREE.Object3D())
  const prefersReducedMotionRef = useRef(false)
  const particles = useMemo(() => {
    if (!config) return []

    return Array.from({ length: config.count }, (_, index) => {
      const t = index * 19.9137 + 7.4
      const radiusMix = 0.5 + Math.sin(t * 0.71) * 0.5
      const radius = THREE.MathUtils.lerp(config.radiusMin, config.radiusMax, radiusMix)
      const angle = (t + 0.82) % (Math.PI * 2)
      const vertical = Math.cos(t * 1.37) * 1.58
      const zMix = 0.5 + Math.sin(t * 0.43) * 0.5
      const z = THREE.MathUtils.lerp(config.depthMin, config.depthMax, zMix)
      const sizeMix = 0.5 + Math.sin(t * 0.97) * 0.5

      return {
        x: Math.cos(angle) * radius,
        y: vertical,
        z,
        size: THREE.MathUtils.lerp(config.sizeMin, config.sizeMax, sizeMix),
        phase: t * 0.31,
        speed: 0.22 + (index % 5) * 0.035,
        driftX: config.drift * (0.32 + (index % 3) * 0.1),
        driftY: config.drift * (0.48 + (index % 4) * 0.07),
        driftZ: config.drift * (0.18 + (index % 2) * 0.1),
      }
    })
  }, [config])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionPreference = () => {
      prefersReducedMotionRef.current = reducedMotionQuery.matches
    }

    handleMotionPreference()
    reducedMotionQuery.addEventListener('change', handleMotionPreference)

    return () => reducedMotionQuery.removeEventListener('change', handleMotionPreference)
  }, [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || particles.length === 0) return

    const object = instanceObjectRef.current
    particles.forEach((particle, index) => {
      object.position.set(particle.x, particle.y, particle.z)
      object.scale.setScalar(particle.size)
      object.updateMatrix()
      mesh.setMatrixAt(index, object.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  }, [particles])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!groupRef.current || !mesh || !config || prefersReducedMotionRef.current) return

    const elapsedTime = clock.elapsedTime
    const object = instanceObjectRef.current
    particles.forEach((particle: StageIonParticle, index) => {
      const phase = particle.phase + elapsedTime * particle.speed
      object.position.set(
        particle.x + Math.sin(phase) * particle.driftX,
        particle.y + Math.cos(phase * 0.73) * particle.driftY,
        particle.z + Math.sin(phase * 0.41) * particle.driftZ,
      )
      object.scale.setScalar(particle.size * (1 + Math.sin(phase * 0.67) * 0.14))
      object.updateMatrix()
      mesh.setMatrixAt(index, object.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
    groupRef.current.rotation.y = Math.sin(elapsedTime * 0.045) * config.drift * 0.32
  })

  if (!config || particles.length === 0) return null

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={config.opacity}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}

function ParticleField({ theme }: OceanEnvironmentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const particles = useMemo(() => {
    return Array.from({ length: theme.particleDensity }, (_, index) => {
      const t = index * 12.9898
      return {
        x: Math.sin(t) * 4.8,
        y: Math.cos(t * 1.72) * 2.8,
        z: -1.8 - Math.abs(Math.sin(t * 0.73)) * 5.4,
        size: 0.012 + (index % 5) * 0.004,
        glow: index < theme.bioluminescenceDensity,
      }
    })
  }, [theme.bioluminescenceDensity, theme.particleDensity])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.05
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.16) * 0.035
  })

  return (
    <group ref={groupRef}>
      {particles.map((particle, index) => (
        <mesh key={index} position={[particle.x, particle.y, particle.z]}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial
            color={particle.glow ? theme.accent : '#d9ffff'}
            transparent
            opacity={particle.glow ? 0.62 : theme.particleOpacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
