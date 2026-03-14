import { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

const Input = ({ className, icon, ...props }: InputProps) => {
  return (
    <div className="relative w-full group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96b0bc] group-focus-within:text-cyan transition-colors">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full bg-[#F0F4F8] border border-[#e2e8f0] rounded-lg py-2 text-sm text-[#0A3D62] outline-none transition-all focus:border-cyan/40 focus:bg-white placeholder:text-[#96b0bc] font-sans",
          icon ? "pl-10" : "pl-4",
          className
        )}
        {...props}
      />
    </div>
  )
}

export default Input