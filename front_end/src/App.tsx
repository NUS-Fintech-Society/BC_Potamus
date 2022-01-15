import { DAppProvider, Kovan } from "@usedapp/core"
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from './pages/home';

function App() {
  return (
    <DAppProvider config={{
      networks: [Kovan],
      notifications: {
        expirationPeriod: 1000,
        checkInterval: 1000
      }
    }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </DAppProvider>
  )
}

export default App
