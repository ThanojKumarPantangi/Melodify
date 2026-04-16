import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <>
      <AppRoutes />

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
          },
        }}
      />
    </>
  );
}