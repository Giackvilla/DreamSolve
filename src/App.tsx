import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Player from './pages/Player';
import Editor from './pages/Editor';
import Settings from './pages/Settings';
import MorningLog from './pages/MorningLog';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'player', element: <Player /> },
      { path: 'editor', element: <Editor /> },
      { path: 'settings', element: <Settings /> },
      { path: 'morning', element: <MorningLog /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
