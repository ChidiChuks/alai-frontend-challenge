import { TldrawComponent } from './TldrawComponent'
import '@tldraw/tldraw/tldraw.css'

function App() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      padding: '20px',
      backgroundColor: '#fdf6e9' // Match the background color from image
    }}>
      <TldrawComponent />
    </div>
  )
}

export default App
