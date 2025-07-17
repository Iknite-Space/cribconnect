
import './App.css';
// import ComingSoon from './comingSoon';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <> 
    <AuthProvider>
     <AppRouter />
    </AuthProvider>
    </>
  );
}

export default App;
