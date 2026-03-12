import { type ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 rounded-xl min-w-[300px] max-w-[500px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
