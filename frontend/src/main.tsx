import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const bootstrap = (): void => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  )

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

bootstrap()

// Enable HMR
if (import.meta.hot) {
  import.meta.hot.accept()
}
