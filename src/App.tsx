import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Player from './pages/Player';
import Editor from './pages/Editor';
import Settings from './pages/Settings';
import MorningLog from './pages/MorningLog';

const router = createBrowserRouter(
  [
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
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

export default function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
