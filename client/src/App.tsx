import { RouterProvider } from 'react-router';
import { AppRouter } from './routes/router';
import { Theme } from '@radix-ui/themes';

export default function App() {
  return (
    <Theme
      appearance='dark'
      accentColor='blue'
      grayColor='gray'
      radius='small'
      scaling='100%'
      className='bg-(--color-background)'
    >
      <RouterProvider router={AppRouter} />
    </Theme>
  );
}
