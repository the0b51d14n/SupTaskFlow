import { type ReactNode } from 'react';

type Props = { children: ReactNode; onClick?: () => void };
export default function Button({ children, onClick }: Props) {
  return (
    <button onClick={onClick} className="px-4 py-2.5 m-1 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
      {children}
    </button>
  );
}