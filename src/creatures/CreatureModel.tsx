import { Component, Suspense } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Center, useGLTF } from '@react-three/drei'
import type { Creature } from '../types/creature'
import { DRACO_DECODER_PATH, useGltfDecoderExtension } from './gltfDecoders'

type CreatureModelProps = {
  creature: Creature
}

type ModelErrorBoundaryProps = {
  children: ReactNode
  url: string
}

type ModelErrorBoundaryState = {
  hasError: boolean
}

export function CreatureModel({ creature }: CreatureModelProps) {
  if (!creature.model.url) return null

  return (
    <Suspense fallback={null}>
      <ModelErrorBoundary key={creature.model.url} url={creature.model.url}>
        <ReviewedGlbModel url={creature.model.url} rotation={creature.model.rotation} />
      </ModelErrorBoundary>
    </Suspense>
  )
}

class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Failed to render creature model.', {
      url: this.props.url,
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) return null

    return this.props.children
  }
}

function ReviewedGlbModel({ url, rotation }: { url: string; rotation?: [number, number, number] }) {
  const extendLoader = useGltfDecoderExtension()
  const gltf = useGLTF(url, DRACO_DECODER_PATH, true, extendLoader)

  return (
    <group rotation={rotation}>
      <Center precise cacheKey={url}>
        <primitive object={gltf.scene} dispose={null} />
      </Center>
    </group>
  )
}
