import {
  Tldraw,
  createTLStore,
  defaultShapeUtils,
  TLShapeId,
  useEditor,
  Editor,
  TldrawEditor,
  Vec2d,
  Box2d,
  TLShape,
  createShapeId,
} from '@tldraw/tldraw'
import { useCallback, useEffect, useMemo, useState } from 'react'

type SpokeInfo = {
  lineId: TLShapeId
  labelId: TLShapeId
  endpointId: TLShapeId
  angle: number
}

export const TldrawComponent = () => {
  const [spokeCount, setSpokeCount] = useState(6)

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={() => spokeCount < 6 && setSpokeCount(prev => prev + 1)} 
          disabled={spokeCount >= 6}
          style={{ marginRight: '10px', padding: '5px 10px' }}
        >
          Add Spoke
        </button>
        <button 
          onClick={() => spokeCount > 2 && setSpokeCount(prev => prev - 1)} 
          disabled={spokeCount <= 2}
          style={{ padding: '5px 10px' }}
        >
          Remove Spoke
        </button>
      </div>
      <div style={{ height: '800px', width: '100%', border: '1px solid #ccc', background: '#fdf6e9' }}>
        <Tldraw
          persistenceKey="hub-and-spokes"
          autoFocus
          showMenu={false}
          showPages={false}
          showTools={false}
        >
          <HubAndSpokes spokeCount={spokeCount} />
        </Tldraw>
      </div>
    </div>
  )
}

const HubAndSpokes = ({ spokeCount }: { spokeCount: number }) => {
  const editor = useEditor()
  const [hubId, setHubId] = useState<TLShapeId | null>(null)
  const [spokes, setSpokes] = useState<SpokeInfo[]>([])

  const createHubAndSpokes = useCallback(() => {
    if (!editor) return

    // Clear existing shapes
    const currentShapes = Object.values(editor.store.get.shapes())
    if (currentShapes.length > 0) {
      editor.deleteShapes(currentShapes.map(shape => shape.id))
    }

    const hubRadius = 100
    const spokeLength = 250
    const viewportBounds = editor.getViewportPageBounds()
    const centerX = viewportBounds.width / 2
    const centerY = viewportBounds.height / 2

    // Create hub
    const hub = editor.createShape({
      id: createShapeId(),
      type: 'geo',
      x: centerX - hubRadius,
      y: centerY - hubRadius,
      props: {
        w: hubRadius * 2,
        h: hubRadius * 2,
        color: '#1a3d4c',
        fill: 'none',
        text: 'HUB',
        size: 'xl',
        geo: 'ellipse',
      },
    })

    setHubId(hub.id)
    const newSpokes: SpokeInfo[] = []

    for (let i = 0; i < spokeCount; i++) {
      const angle = ((i * 2 * Math.PI) / spokeCount) - (Math.PI / 2)
      const endX = centerX + Math.cos(angle) * spokeLength
      const endY = centerY + Math.sin(angle) * spokeLength

      const line = editor.createShape({
        id: createShapeId(),
        type: 'line',
        x: centerX,
        y: centerY,
        props: {
          points: [
            { x: 0, y: 0 },
            { x: endX - centerX, y: endY - centerY },
          ],
          color: '#1a3d4c',
          size: 'm',
        },
      })

      const endpoint = editor.createShape({
        id: createShapeId(),
        type: 'geo',
        x: endX - 5,
        y: endY - 5,
        props: {
          w: 10,
          h: 10,
          color: '#1a3d4c',
          fill: '#1a3d4c',
          geo: 'ellipse',
        },
      })

      const textOffset = 40
      const text = editor.createShape({
        id: createShapeId(),
        type: 'text',
        x: endX + Math.cos(angle) * textOffset,
        y: endY + Math.sin(angle) * textOffset,
        props: {
          text: 'Non ullamco eiusmod cupidatat deserunt\noccaecat qui non sit cilium pariatur culpa in.',
          color: '#1a3d4c',
          align: 'start',
          size: 'm',
          w: 250,
        },
      })

      newSpokes.push({ lineId: line.id, labelId: text.id, endpointId: endpoint.id, angle })
    }

    setSpokes(newSpokes)
  }, [editor, spokeCount])

  useEffect(() => {
    if (!editor) return
    
    const unsubscribe = editor.store.listen(() => {
      if (editor.getShape(hubId as TLShapeId)) return
      createHubAndSpokes()
    })

    return () => {
      unsubscribe()
    }
  }, [editor, hubId, createHubAndSpokes])

  const updateSpokePosition = useCallback((
    hubCenter: Vec2d,
    textCenter: Vec2d,
    spokeInfo: SpokeInfo,
    maintainDistance = true
  ) => {
    if (!editor) return

    const direction = textCenter.sub(hubCenter).uni()
    const spokeLength = maintainDistance ? textCenter.sub(hubCenter).len() : 250

    editor.updateShape({
      id: spokeInfo.lineId,
      type: 'line',
      x: hubCenter.x,
      y: hubCenter.y,
      props: {
        points: [
          { x: 0, y: 0 },
          { x: direction.x * spokeLength, y: direction.y * spokeLength },
        ],
      },
    })

    const endpointPos = hubCenter.add(direction.mul(spokeLength))
    editor.updateShape({
      id: spokeInfo.endpointId,
      type: 'ellipse',
      x: endpointPos.x - 5,
      y: endpointPos.y - 5,
    })
  }, [editor])

  useEffect(() => {
    if (!editor || !hubId) return

    const handleChange = editor.on('shape:change', (e) => {
      const shape = editor.getShape(e.shape.id)
      if (!shape) return

      const hub = editor.getShape(hubId)
      if (!hub) return

      const hubCenter = new Vec2d(
        hub.x + (hub.props.w as number) / 2,
        hub.y + (hub.props.h as number) / 2
      )

      if (shape.id === hubId) {
        spokes.forEach(spoke => {
          const text = editor.getShape(spoke.labelId)
          if (!text) return

          const textCenter = new Vec2d(text.x, text.y)
          const relativePos = textCenter.sub(hubCenter)
          const newTextPos = hubCenter.add(relativePos)

          editor.updateShape({
            id: spoke.labelId,
            type: 'text',
            x: newTextPos.x,
            y: newTextPos.y,
          })

          updateSpokePosition(hubCenter, newTextPos, spoke)
        })
      } else {
        const movedSpoke = spokes.find(s => s.labelId === shape.id)
        if (movedSpoke) {
          const textCenter = new Vec2d(shape.x, shape.y)
          
          spokes.forEach(otherSpoke => {
            if (otherSpoke.labelId === shape.id) return
            const otherText = editor.getShape(otherSpoke.labelId)
            if (!otherText) return

            const bounds1 = editor.getShapePageBounds(shape)
            const bounds2 = editor.getShapePageBounds(otherText)
            
            if (bounds1 && bounds2 && bounds1.collides(bounds2)) {
              const angle = Math.atan2(
                shape.y - otherText.y,
                shape.x - otherText.x
              )
              const minDistance = 60
              
              shape.x = otherText.x + Math.cos(angle) * minDistance
              shape.y = otherText.y + Math.sin(angle) * minDistance
            }
          })

          updateSpokePosition(hubCenter, new Vec2d(shape.x, shape.y), movedSpoke, false)
        }
      }
    })

    return () => {
      handleChange()
    }
  }, [editor, hubId, spokes, updateSpokePosition])

  return null
}
