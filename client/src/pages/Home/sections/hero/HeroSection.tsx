import BgScene from './BgScene';

export default function HeroSection() {
  return (
    <div className='z-10 flex h-full w-full flex-col items-center justify-center text-center'>
        <BgScene />
      <h1 className='text-4xl font-bold'>Home</h1>
      <p className='text-base-content/70 mt-4'>Welcome to my portfolio.</p>
    </div>
  );
}
