"use client"
import ComponentsPinsMapper from '@/components/ComponentsPinsMapper'
import { componentsList } from '@/components/electrical-components/components-list'
import { useState } from 'react';

function Mapper() {
    const [type, setType] = useState<string | null>(null);
  return (
    <div>
        <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4 flex flex-wrap gap-4 items-stretch">
                {Object.keys(componentsList).map((category) => (
                    <div key={category}>
                        <button onClick={() => setType(category)} style={{backgroundColor: type == category ? "yellow" : "white"}} className="px-3 py-1 rounded shadow border">{category}</button>
                    </div>
                ))}
            </div>
        </div>
      <ComponentsPinsMapper type={type || ""} />
    </div>
  )
}

export default Mapper