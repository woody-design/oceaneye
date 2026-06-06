import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { WebGLRenderer } from 'three'
import type { GLTFLoader } from 'three-stdlib'
import { KTX2Loader } from 'three-stdlib'

export const DRACO_DECODER_PATH = '/draco/'
export const BASIS_TRANSCODER_PATH = '/basis/'

let sharedKtx2Loader: KTX2Loader | null = null

export function useGltfDecoderExtension() {
  const gl = useThree((state) => state.gl)

  return useMemo(() => {
    const ktx2Loader = getKtx2Loader(gl)

    return (loader: GLTFLoader) => {
      loader.setKTX2Loader(ktx2Loader)
    }
  }, [gl])
}

export function extendPreloadedGltf(loader: GLTFLoader) {
  loader.setKTX2Loader(getPreloadKtx2Loader())
}

function getKtx2Loader(renderer: WebGLRenderer) {
  if (sharedKtx2Loader) return sharedKtx2Loader

  sharedKtx2Loader = createKtx2Loader(renderer)
  return sharedKtx2Loader
}

function getPreloadKtx2Loader() {
  if (sharedKtx2Loader) return sharedKtx2Loader

  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  })

  sharedKtx2Loader = createKtx2Loader(renderer)
  renderer.dispose()
  return sharedKtx2Loader
}

function createKtx2Loader(renderer: WebGLRenderer) {
  return new KTX2Loader()
    .setTranscoderPath(BASIS_TRANSCODER_PATH)
    .detectSupport(renderer)
}
