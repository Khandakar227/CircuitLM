import React from 'react'

export default function WireRouteSelect({
    value,
    onChange
}: {
    value: string | null,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <select
    value={value || 'auto'}
    onChange={onChange}
    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    >
        <option value="auto">Auto (Smart)</option>
        <option value="l-shape">L-Shape (Right)</option>
        <option value="up-l">Up L-Shape</option>
        <option value="down-l">Down L-Shape</option>
        <option value="z-shape">Z-Shape</option>
        <option value="reverse-z">Reverse Z-Shape</option>
        <option value="u-shape">U-Shape (Down)</option>
        <option value="reverse-u">Reverse U-Shape (Up)</option>
        <option value="direct">Direct</option>
        <option value="custom">Custom (Draggable)</option>
    </select>
  )
}
