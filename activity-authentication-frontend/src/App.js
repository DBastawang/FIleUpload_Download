import { createBrowserRouter, RouterProvider } from 'react-router';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

let router = createBrowserRouter([
  {
    path: '/',
    Component: LoginPage,
  },
  {
    path: '/home',
    Component: HomePage,
  },
]);


function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
