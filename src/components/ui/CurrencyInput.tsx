import React, { useState, useEffect } from 'react'

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number
  onChange: (val: number) => void
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, className, ...props }) => {
  const [displayValue, setDisplayValue] = useState('')

  // Sinkronisasi nilai dari parent ke tampilan
  useEffect(() => {
    if (value === 0 || isNaN(value)) {
      setDisplayValue('') // Kosongkan jika 0 agar gampang diketik
    } else {
      setDisplayValue(new Intl.NumberFormat('id-ID').format(value))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Ambil nilai ketikan user
    const rawValue = e.target.value

    // 2. Buang semua karakter selain angka (biar titiknya hilang sementara)
    const numericString = rawValue.replace(/\D/g, '')
    const numericValue = parseInt(numericString, 10)

    // 3. Update state
    if (isNaN(numericValue)) {
      setDisplayValue('')
      onChange(0) // Kirim angka 0 ke parent
    } else {
      setDisplayValue(new Intl.NumberFormat('id-ID').format(numericValue))
      onChange(numericValue) // Kirim angka asli (tanpa titik) ke parent
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric" // Memunculkan keyboard angka di HP
      value={displayValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  )
}

export default CurrencyInput