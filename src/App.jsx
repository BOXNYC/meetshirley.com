import { createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home'
import Layout from './components/Layout'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min"
import './App.css'
import settingsContext from "./settingsContext.js"
import settings from './settings.json'

function App() {
  return (
    <settingsContext.Provider value={settings}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </settingsContext.Provider>
  )
}

export default App
