import nodeLogo from './assets/node.svg'
import { useState } from 'react'
import Update from '@/components/update'
import Sidebar from '@/components/Sidebar'
import ChatContainer from '@/components/ChatContainer'
import ChatGLM from './components/ChatGLM'
import './App.scss'

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className='app'>
      <Sidebar />
      <ChatGLM />
    </div>
  )
}

export default App
