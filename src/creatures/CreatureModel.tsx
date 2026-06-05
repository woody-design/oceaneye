import { Suspense } from 'react'
import { Center, useGLTF } from '@react-three/drei'
import type { Creature } from '../types/creature'

type CreatureModelProps = {
  creature: Creature
}

export function CreatureModel({ creature }: CreatureModelProps) {
  if (creature.model.url) {
    return (
      <Suspense fallback={null}>
        <ReviewedGlbModel url={creature.model.url} rotation={creature.model.rotation} />
      </Suspense>
    )
  }

  return <PlaceholderModel creature={creature} />
}

function ReviewedGlbModel({ url, rotation }: { url: string; rotation?: [number, number, number] }) {
  const gltf = useGLTF(url)

  return (
    <group rotation={rotation}>
      <Center precise cacheKey={url}>
        <primitive object={gltf.scene} dispose={null} />
      </Center>
    </group>
  )
}

function PlaceholderModel({ creature }: CreatureModelProps) {
  switch (creature.model.placeholderKind) {
    case 'reef-pair':
      return <ReefPair />
    case 'turtle':
      return <Turtle />
    case 'manta':
      return <MantaRay />
    case 'orca':
      return <Orca />
    case 'yellow-boxfish':
      return <YellowBoxfish />
    case 'longspine-seahorse':
      return <LongspineSeahorse />
    case 'barreleye':
      return <Barreleye />
    case 'dumbo-octopus':
      return <DumboOctopus />
    case 'giant-oarfish':
      return <GiantOarfish />
    case 'ocean-sunfish':
      return <OceanSunfish />
    case 'tripod-fish':
      return <TripodFish />
    case 'sea-pig':
      return <SeaPig />
    case 'hadal-snailfish':
      return <HadalSnailfish />
    default:
      return null
  }
}

function ReefPair() {
  const tentacles = Array.from({ length: 18 }, (_, index) => {
    const angle = (index / 18) * Math.PI * 2
    const radius = 0.46 + (index % 4) * 0.055
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      height: 0.62 + (index % 5) * 0.055,
      rotation: [Math.sin(angle) * 0.22, 0, -Math.cos(angle) * 0.2] as [number, number, number],
    }
  })

  return (
    <group position={[0, -0.12, 0]}>
      <mesh position={[0, -0.72, 0]} scale={[1.15, 0.18, 1.0]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color="#8b4d7c" roughness={0.72} />
      </mesh>
      {tentacles.map((tentacle, index) => (
        <group key={index} position={[tentacle.x, -0.42, tentacle.z]} rotation={tentacle.rotation}>
          <mesh position={[0, tentacle.height / 2, 0]}>
            <cylinderGeometry args={[0.035, 0.055, tentacle.height, 12]} />
            <meshStandardMaterial color={index % 2 ? '#f0a6ba' : '#e97899'} roughness={0.48} />
          </mesh>
          <mesh position={[0, tentacle.height + 0.02, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#ffd0d9" roughness={0.4} />
          </mesh>
        </group>
      ))}
      <group position={[-0.54, 0.2, 0.2]} rotation={[0.05, -0.18, 0]}>
        <mesh scale={[0.68, 0.28, 0.24]}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshStandardMaterial color="#ff7f2f" roughness={0.36} />
        </mesh>
        {[-0.22, 0.08, 0.35].map((x) => (
          <mesh key={x} position={[x, 0.01, 0.0]} scale={[0.05, 0.3, 0.255]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#fff7ed" roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0.58, 0.08, 0.02]} scale={[0.08, 0.08, 0.08]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#101215" />
        </mesh>
        <mesh position={[-0.68, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.18, 0.32, 0.08]}>
          <coneGeometry args={[1, 1.2, 3]} />
          <meshStandardMaterial color="#ff9c42" roughness={0.36} />
        </mesh>
      </group>
    </group>
  )
}

function Turtle() {
  return (
    <group rotation={[0.04, -0.25, 0]}>
      <mesh scale={[0.92, 0.28, 1.24]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color="#4d7b4e" roughness={0.72} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.12, 0]} scale={[0.72, 0.08, 0.92]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color="#8a9d5a" roughness={0.86} />
      </mesh>
      <mesh position={[0, -0.08, 1.05]} scale={[0.28, 0.2, 0.34]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#6c8a58" roughness={0.68} />
      </mesh>
      {[[-0.88, -0.08, 0.42, -0.55], [0.88, -0.08, 0.42, 0.55]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0.12, 0, rot]} scale={[0.68, 0.08, 0.24]}>
          <sphereGeometry args={[1, 24, 12]} />
          <meshStandardMaterial color="#5c7c50" roughness={0.72} />
        </mesh>
      ))}
      {[[-0.62, -0.08, -0.74, 0.35], [0.62, -0.08, -0.74, -0.35]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0, 0, rot]} scale={[0.34, 0.07, 0.18]}>
          <sphereGeometry args={[1, 18, 10]} />
          <meshStandardMaterial color="#5c7c50" roughness={0.72} />
        </mesh>
      ))}
    </group>
  )
}

function MantaRay() {
  return (
    <group rotation={[0.16, 0.1, 0]}>
      <mesh scale={[1.05, 0.12, 0.82]}>
        <sphereGeometry args={[1, 48, 18]} />
        <meshStandardMaterial color="#213a4a" roughness={0.52} />
      </mesh>
      {[[-1.04, 0, 0.04, 0.2], [1.04, 0, 0.04, -0.2]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0, 0, rot]} scale={[1.2, 0.04, 0.72]}>
          <sphereGeometry args={[1, 32, 12]} />
          <meshStandardMaterial color="#1b303f" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, -0.03, 0.95]} scale={[0.5, 0.08, 0.2]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshStandardMaterial color="#e7f2ec" roughness={0.7} />
      </mesh>
      {[[-0.22, 0.02, 0.94, -0.8], [0.22, 0.02, 0.94, 0.8]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0.4, 0, rot]} scale={[0.08, 0.05, 0.28]}>
          <capsuleGeometry args={[1, 1.1, 8, 16]} />
          <meshStandardMaterial color="#dfece8" roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, -0.02, -0.98]} rotation={[Math.PI / 2, 0, 0]} scale={[0.018, 0.018, 1.5]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color="#253845" roughness={0.62} />
      </mesh>
    </group>
  )
}

function Orca() {
  return (
    <group rotation={[0.04, -1.28, 0]} position={[0, -0.02, 0]}>
      <mesh scale={[0.48, 0.34, 1.36]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color="#061521" roughness={0.46} />
      </mesh>
      <mesh position={[0, -0.12, 0.28]} scale={[0.42, 0.12, 0.84]}>
        <sphereGeometry args={[1, 32, 14]} />
        <meshStandardMaterial color="#edf4f2" roughness={0.54} />
      </mesh>
      <mesh position={[0, 0.42, 0.05]} rotation={[0.28, 0, 0]} scale={[0.08, 0.58, 0.22]}>
        <coneGeometry args={[1, 1.8, 24]} />
        <meshStandardMaterial color="#071522" roughness={0.5} />
      </mesh>
      {[[-0.38, -0.04, 0.18, 0.35], [0.38, -0.04, 0.18, -0.35]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0.35, 0, rot]} scale={[0.13, 0.06, 0.58]}>
          <sphereGeometry args={[1, 28, 12]} />
          <meshStandardMaterial color="#071522" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0, -1.36]} rotation={[Math.PI / 2, 0, 0]} scale={[0.06, 0.06, 0.72]}>
        <cylinderGeometry args={[1, 0.65, 1, 16]} />
        <meshStandardMaterial color="#071522" roughness={0.52} />
      </mesh>
      {[[-0.26, 0, -1.82, -0.35], [0.26, 0, -1.82, 0.35]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0, 0, rot]} scale={[0.42, 0.04, 0.16]}>
          <sphereGeometry args={[1, 22, 10]} />
          <meshStandardMaterial color="#0a1a27" roughness={0.52} />
        </mesh>
      ))}
      {[[-0.22, 0.12, 0.86], [0.22, 0.12, 0.86]].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} scale={[0.09, 0.035, 0.05]}>
          <sphereGeometry args={[1, 18, 10]} />
          <meshStandardMaterial color="#edf4f2" roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}

function YellowBoxfish() {
  return (
    <group rotation={[0.04, -1.1, 0]} position={[0, -0.05, 0]}>
      <mesh scale={[0.72, 0.42, 0.92]}>
        <sphereGeometry args={[1, 44, 22]} />
        <meshStandardMaterial color="#e6c31c" roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.02, 0.86]} scale={[0.22, 0.18, 0.18]}>
        <sphereGeometry args={[1, 24, 14]} />
        <meshStandardMaterial color="#dcb71a" roughness={0.64} />
      </mesh>
      <mesh position={[0, -0.02, 1.06]} rotation={[Math.PI / 2, 0, 0]} scale={[0.075, 0.075, 0.045]}>
        <torusGeometry args={[1, 0.25, 12, 24]} />
        <meshStandardMaterial color="#c99576" roughness={0.58} />
      </mesh>
      {[[-0.24, 0.18, 0.72], [0.24, 0.18, 0.72]].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} scale={[0.045, 0.045, 0.045]}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshBasicMaterial color="#11161b" />
        </mesh>
      ))}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, -0.05, 0.24]} rotation={[0.18, 0, x < 0 ? 0.55 : -0.55]} scale={[0.12, 0.035, 0.22]}>
          <sphereGeometry args={[1, 20, 10]} />
          <meshStandardMaterial color="#f2df83" roughness={0.5} transparent opacity={0.82} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, -0.2]} rotation={[0.08, 0, 0]} scale={[0.08, 0.28, 0.18]}>
        <coneGeometry args={[1, 1.4, 22]} />
        <meshStandardMaterial color="#f1dc76" roughness={0.52} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, -0.02, -0.9]} rotation={[Math.PI / 2, 0, 0]} scale={[0.08, 0.08, 0.34]}>
        <cylinderGeometry args={[1, 0.72, 1, 18]} />
        <meshStandardMaterial color="#dcb51b" roughness={0.64} />
      </mesh>
      <mesh position={[0, -0.02, -1.18]} rotation={[0, 0, Math.PI / 2]} scale={[0.38, 0.045, 0.26]}>
        <sphereGeometry args={[1, 24, 10]} />
        <meshStandardMaterial color="#f0dc75" roughness={0.52} transparent opacity={0.82} />
      </mesh>
      {[
        [-0.34, 0.12, 0.48],
        [-0.18, 0.2, 0.18],
        [0.24, 0.12, -0.02],
        [0.38, -0.04, 0.34],
        [-0.28, -0.16, -0.26],
        [0.08, 0.24, -0.42],
        [0.18, -0.2, 0.62],
      ].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} scale={[0.035, 0.035, 0.035]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#2a2415" roughness={0.72} />
        </mesh>
      ))}
    </group>
  )
}

function LongspineSeahorse() {
  const ringYs = Array.from({ length: 12 }, (_, index) => -0.62 + index * 0.105)
  const spineYs = Array.from({ length: 9 }, (_, index) => -0.48 + index * 0.14)

  return (
    <group rotation={[0.02, -1.15, 0]} position={[0, -0.06, 0]}>
      <mesh position={[0, 0.16, 0.26]} scale={[0.34, 0.72, 0.22]}>
        <sphereGeometry args={[1, 44, 22]} />
        <meshStandardMaterial color="#c7502f" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.76, 0.35]} rotation={[-0.18, 0, 0]} scale={[0.3, 0.24, 0.28]}>
        <sphereGeometry args={[1, 34, 18]} />
        <meshStandardMaterial color="#d9653c" roughness={0.56} />
      </mesh>
      <mesh position={[0, 0.92, 0.72]} rotation={[Math.PI / 2, 0, 0]} scale={[0.048, 0.048, 0.58]}>
        <cylinderGeometry args={[1, 0.68, 1, 18]} />
        <meshStandardMaterial color="#d85c37" roughness={0.54} />
      </mesh>
      <mesh position={[0, 0.95, 1.08]} rotation={[Math.PI / 2, 0, 0]} scale={[0.058, 0.058, 0.06]}>
        <coneGeometry args={[1, 1.2, 18]} />
        <meshStandardMaterial color="#db6b43" roughness={0.54} />
      </mesh>
      <mesh position={[-0.12, 0.8, 0.5]} scale={[0.03, 0.03, 0.03]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial color="#111317" />
      </mesh>
      <mesh position={[-0.2, 0.62, 0.24]} rotation={[0.18, 0, 0.42]} scale={[0.14, 0.032, 0.2]}>
        <sphereGeometry args={[1, 20, 10]} />
        <meshStandardMaterial color="#e8e6d2" roughness={0.52} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0.02, 0.2, -0.02]} rotation={[0.08, 0, 0]} scale={[0.2, 0.03, 0.26]}>
        <sphereGeometry args={[1, 20, 10]} />
        <meshStandardMaterial color="#e8e6d2" roughness={0.52} transparent opacity={0.72} />
      </mesh>
      {ringYs.map((y, index) => (
        <mesh key={y} position={[0, y, 0.1 - Math.abs(y) * 0.12]} scale={[0.32 - index * 0.01, 0.012, 0.2]}>
          <torusGeometry args={[1, 0.035, 8, 26]} />
          <meshStandardMaterial color="#e17952" roughness={0.58} />
        </mesh>
      ))}
      <group position={[0, -0.72, -0.05]}>
        {Array.from({ length: 15 }, (_, index) => {
          const t = index / 14
          const angle = t * Math.PI * 1.82
          const radius = 0.48 - t * 0.31
          return (
            <mesh
              key={index}
              position={[Math.cos(angle) * radius, -Math.sin(angle) * radius, -0.04]}
              rotation={[0, 0, angle]}
              scale={[0.07 - t * 0.025, 0.05 - t * 0.018, 0.14 - t * 0.05]}
            >
              <sphereGeometry args={[1, 18, 10]} />
              <meshStandardMaterial color={index % 2 ? '#d55e39' : '#c84f30'} roughness={0.58} />
            </mesh>
          )
        })}
      </group>
      {spineYs.map((y, index) => (
        <mesh key={y} position={[0, y, -0.14]} rotation={[-1.18, 0, 0]} scale={[0.032, 0.032, 0.18 + index * 0.008]}>
          <coneGeometry args={[1, 1.8, 12]} />
          <meshStandardMaterial color="#8f2d20" roughness={0.62} />
        </mesh>
      ))}
      {[[-0.08, 0.98, 0.36], [0.08, 0.98, 0.36], [0, 1.02, 0.3]].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[0.2, 0, x < 0 ? -0.25 : 0.25]} scale={[0.03, 0.03, 0.18]}>
          <coneGeometry args={[1, 1.7, 12]} />
          <meshStandardMaterial color="#8f2d20" roughness={0.62} />
        </mesh>
      ))}
    </group>
  )
}

function Barreleye() {
  return (
    <group rotation={[0.03, -0.22, 0]}>
      <mesh position={[0, -0.05, -0.34]} scale={[0.5, 0.26, 0.92]}>
        <sphereGeometry args={[1, 40, 18]} />
        <meshStandardMaterial color="#4b6678" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.2, 0.55]} scale={[0.46, 0.38, 0.42]}>
        <sphereGeometry args={[1, 40, 20]} />
        <meshPhysicalMaterial color="#b8fff1" roughness={0.05} transmission={0.55} transparent opacity={0.34} />
      </mesh>
      {[[-0.16, 0.28, 0.62], [0.16, 0.28, 0.62]].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0.9, 0, 0]} scale={[0.08, 0.08, 0.24]}>
          <capsuleGeometry args={[1, 0.8, 8, 18]} />
          <meshStandardMaterial color="#61d778" emissive="#1d6a32" emissiveIntensity={0.5} roughness={0.28} />
        </mesh>
      ))}
      {[[-0.14, 0.04, 0.93], [0.14, 0.04, 0.93]].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} scale={[0.045, 0.045, 0.045]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#10151a" />
        </mesh>
      ))}
    </group>
  )
}

function SeaPig() {
  const feet = [-0.58, -0.34, -0.1, 0.14, 0.38, 0.62]
  return (
    <group rotation={[0.04, -0.18, 0]} position={[0, -0.12, 0]}>
      <mesh position={[0, 0.04, 0]} scale={[0.9, 0.34, 0.52]}>
        <sphereGeometry args={[1, 36, 18]} />
        <meshPhysicalMaterial color="#eda4b4" roughness={0.35} transmission={0.2} transparent opacity={0.68} />
      </mesh>
      {feet.map((x, index) => (
        <mesh key={x} position={[x, -0.46, index % 2 ? -0.18 : 0.2]} rotation={[0.08, 0, index % 2 ? -0.12 : 0.12]}>
          <cylinderGeometry args={[0.026, 0.04, 0.72, 10]} />
          <meshStandardMaterial color="#f0b6c4" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0.74, -0.05, 0.18]} scale={[0.14, 0.12, 0.12]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#b06b7f" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.84, 0]} scale={[2.4, 0.04, 1.6]}>
        <sphereGeometry args={[1, 32, 8]} />
        <meshStandardMaterial color="#4b3f3a" roughness={0.95} />
      </mesh>
    </group>
  )
}

function TripodFish() {
  return (
    <group rotation={[0.02, -1.18, 0]} position={[0, -0.1, 0]}>
      <mesh position={[0, 0.22, 0]} scale={[0.34, 0.18, 1.08]}>
        <sphereGeometry args={[1, 44, 18]} />
        <meshStandardMaterial color="#8e989b" roughness={0.66} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.24, 0.95]} scale={[0.22, 0.17, 0.28]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color="#7f898d" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.2, 1.2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.045, 0.045, 0.1]}>
        <cylinderGeometry args={[1, 0.68, 1, 16]} />
        <meshStandardMaterial color="#6f787b" roughness={0.7} />
      </mesh>
      {[[-0.1, 0.3, 1.16], [0.1, 0.3, 1.16]].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} scale={[0.025, 0.025, 0.025]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#15191b" />
        </mesh>
      ))}
      <mesh position={[0, 0.46, 0.2]} rotation={[0.1, 0, 0]} scale={[0.08, 0.36, 0.28]}>
        <coneGeometry args={[1, 1.45, 22]} />
        <meshStandardMaterial color="#aab5b7" roughness={0.56} transparent opacity={0.78} />
      </mesh>
      {[[-0.34, 0.1, 0.46, 0.5], [0.34, 0.1, 0.46, -0.5]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0.18, 0, rot]} scale={[0.22, 0.035, 0.46]}>
          <sphereGeometry args={[1, 24, 10]} />
          <meshStandardMaterial color="#b6c0c2" roughness={0.55} transparent opacity={0.74} />
        </mesh>
      ))}
      {[[-0.24, -0.55, 0.28, -0.18], [0.24, -0.55, 0.28, 0.18], [0, -0.46, -0.92, 0]].map(([x, y, z, rot], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[0.08, 0, rot]} scale={[0.018, 0.018, index === 2 ? 1.08 : 1.22]}>
          <cylinderGeometry args={[1, 0.55, 1, 8]} />
          <meshStandardMaterial color="#9da9ac" roughness={0.62} transparent opacity={0.84} />
        </mesh>
      ))}
      <mesh position={[0, 0.18, -1.05]} rotation={[0, 0, Math.PI / 2]} scale={[0.3, 0.04, 0.2]}>
        <sphereGeometry args={[1, 22, 10]} />
        <meshStandardMaterial color="#a5b0b2" roughness={0.58} transparent opacity={0.78} />
      </mesh>
    </group>
  )
}

function OceanSunfish() {
  return (
    <group rotation={[0.02, -1.22, 0]} position={[0, -0.02, 0]}>
      <mesh scale={[0.72, 0.26, 1.0]}>
        <sphereGeometry args={[1, 56, 28]} />
        <meshStandardMaterial color="#9fb0b3" roughness={0.58} metalness={0.02} />
      </mesh>
      <mesh position={[0.52, 0, 0]} scale={[0.22, 0.2, 0.82]}>
        <sphereGeometry args={[1, 36, 18]} />
        <meshStandardMaterial color="#899da4" roughness={0.62} />
      </mesh>
      {[0.34, 0.48, 0.62].map((z, index) => (
        <mesh key={z} position={[0.72, 0, z - 0.48]} rotation={[0, 0, index % 2 ? 0.18 : -0.14]} scale={[0.12, 0.035, 0.18]}>
          <sphereGeometry args={[1, 18, 8]} />
          <meshStandardMaterial color="#8da0a6" roughness={0.64} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.96]} rotation={[0.08, 0, 0]} scale={[0.14, 0.06, 0.76]}>
        <coneGeometry args={[1, 1.7, 28]} />
        <meshStandardMaterial color="#778c96" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, -0.96]} rotation={[Math.PI - 0.08, 0, 0]} scale={[0.14, 0.06, 0.76]}>
        <coneGeometry args={[1, 1.7, 28]} />
        <meshStandardMaterial color="#7f939b" roughness={0.6} />
      </mesh>
      <mesh position={[-0.28, -0.24, 0.12]} rotation={[0.16, 0, 0.46]} scale={[0.16, 0.04, 0.2]}>
        <sphereGeometry args={[1, 22, 10]} />
        <meshStandardMaterial color="#c3cbd0" roughness={0.62} />
      </mesh>
      <mesh position={[-0.62, -0.03, 0.1]} rotation={[Math.PI / 2, 0, 0]} scale={[0.065, 0.065, 0.035]}>
        <torusGeometry args={[1, 0.24, 12, 26]} />
        <meshStandardMaterial color="#707f85" roughness={0.6} />
      </mesh>
      <mesh position={[-0.48, -0.13, 0.28]} scale={[0.032, 0.032, 0.032]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial color="#11161a" />
      </mesh>
    </group>
  )
}

function DumboOctopus() {
  const arms = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2
    return {
      x: Math.cos(angle) * 0.34,
      z: Math.sin(angle) * 0.28,
      rotation: [0.24 + Math.sin(angle) * 0.08, angle, Math.cos(angle) * 0.18] as [number, number, number],
      length: 0.74 + (index % 2) * 0.08,
    }
  })

  return (
    <group rotation={[0.08, -0.25, 0]} position={[0, -0.1, 0]}>
      <mesh position={[0, 0.22, 0]} scale={[0.62, 0.56, 0.52]}>
        <sphereGeometry args={[1, 44, 24]} />
        <meshPhysicalMaterial color="#e59a82" roughness={0.56} transmission={0.18} transparent opacity={0.86} />
      </mesh>
      {[[-0.46, 0.28, 0.02, 0.55], [0.46, 0.28, 0.02, -0.55]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0.12, 0, rot]} scale={[0.28, 0.055, 0.2]}>
          <sphereGeometry args={[1, 28, 12]} />
          <meshStandardMaterial color="#f0b098" roughness={0.62} />
        </mesh>
      ))}
      <mesh position={[0, -0.24, 0]} scale={[0.6, 0.05, 0.48]}>
        <sphereGeometry args={[1, 36, 10]} />
        <meshPhysicalMaterial color="#d98272" roughness={0.62} transmission={0.12} transparent opacity={0.34} />
      </mesh>
      {arms.map((arm, index) => (
        <mesh
          key={index}
          position={[arm.x, -0.48, arm.z]}
          rotation={arm.rotation}
          scale={[0.06, arm.length, 0.045]}
        >
          <capsuleGeometry args={[1, 0.45, 8, 16]} />
          <meshStandardMaterial color={index % 2 ? '#efad96' : '#dc8f7d'} roughness={0.58} />
        </mesh>
      ))}
      {[[-0.14, 0.25, 0.48], [0.14, 0.25, 0.48]].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} scale={[0.035, 0.035, 0.035]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#150c0d" />
        </mesh>
      ))}
    </group>
  )
}

function GiantOarfish() {
  return (
    <group rotation={[0.02, -1.25, 0]} position={[0, -0.04, 0]}>
      <mesh position={[0, 0.02, 0]} scale={[0.26, 0.18, 1.62]}>
        <sphereGeometry args={[1, 56, 16]} />
        <meshStandardMaterial color="#b9cbd2" roughness={0.5} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.22, 0]} scale={[0.055, 0.24, 1.52]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#a8433d" roughness={0.56} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.24, 1.38]} rotation={[0.25, 0, 0]} scale={[0.1, 0.52, 0.2]}>
        <coneGeometry args={[1, 1.8, 18]} />
        <meshStandardMaterial color="#b54741" roughness={0.54} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, 0.02, 1.62]} scale={[0.34, 0.28, 0.3]}>
        <sphereGeometry args={[1, 36, 18]} />
        <meshStandardMaterial color="#c9d8dc" roughness={0.48} />
      </mesh>
      <mesh position={[0, -0.02, 1.88]} rotation={[Math.PI / 2, 0, 0]} scale={[0.095, 0.095, 0.052]}>
        <torusGeometry args={[1, 0.22, 12, 24]} />
        <meshStandardMaterial color="#c6a4a2" roughness={0.52} />
      </mesh>
      {[[-0.11, 0.1, 1.72], [0.11, 0.1, 1.72]].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} scale={[0.035, 0.035, 0.035]}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshBasicMaterial color="#10151a" />
        </mesh>
      ))}
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, -0.28, 1.42]} rotation={[0.72, 0, x < 0 ? 0.08 : -0.08]} scale={[0.016, 0.016, 0.98]}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial color="#b4443f" roughness={0.52} />
        </mesh>
      ))}
      <mesh position={[0, 0.0, -1.62]} scale={[0.11, 0.08, 0.34]}>
        <coneGeometry args={[1, 1.6, 18]} />
        <meshStandardMaterial color="#9fb6bf" roughness={0.58} />
      </mesh>
    </group>
  )
}

function HadalSnailfish() {
  return (
    <group rotation={[0.04, -1.18, 0]} position={[0, -0.04, 0]}>
      <mesh position={[-0.08, 0.02, 0]} scale={[0.56, 0.26, 0.92]}>
        <sphereGeometry args={[1, 42, 20]} />
        <meshPhysicalMaterial color="#d9d7d8" roughness={0.72} transmission={0.24} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0.02, 0.04, 0.78]} scale={[0.42, 0.3, 0.38]}>
        <sphereGeometry args={[1, 36, 18]} />
        <meshPhysicalMaterial color="#ece2df" roughness={0.68} transmission={0.18} transparent opacity={0.86} />
      </mesh>
      <mesh position={[0, -0.02, -0.92]} rotation={[Math.PI / 2, 0, 0]} scale={[0.09, 0.09, 0.95]}>
        <coneGeometry args={[1, 1.6, 18]} />
        <meshStandardMaterial color="#c9cdd0" roughness={0.76} />
      </mesh>
      {[[-0.2, -0.17, 0.36, -0.28], [0.2, -0.17, 0.36, 0.28]].map(([x, y, z, rot]) => (
        <mesh key={x} position={[x, y, z]} rotation={[0.15, 0, rot]} scale={[0.18, 0.035, 0.32]}>
          <sphereGeometry args={[1, 22, 10]} />
          <meshStandardMaterial color="#cfd4d7" roughness={0.72} />
        </mesh>
      ))}
      {[[-0.12, 0.12, 1.08], [0.12, 0.12, 1.08]].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} scale={[0.026, 0.026, 0.026]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#111317" />
        </mesh>
      ))}
    </group>
  )
}
