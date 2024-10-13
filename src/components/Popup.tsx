import { ReactNode, useRef } from "react";
import { useOnClickOutside } from 'usehooks-ts';
import { XIcon } from "lucide-react";

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Popup: React.FC<PopupProps> = ({ isOpen, onClose, title, children }) => {
    const ref = useRef(null)
    useOnClickOutside(ref, onClose)

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 w-screen h-screen  z-50 flex items-center justify-center p-4 ">
            <div ref={ref} className="bg-white p-6 max-w-sm w-full relative">
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-xl text-blue-600 font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XIcon size={24} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};