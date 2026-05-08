// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-champagne/20 border-t-champagne rounded-full animate-spin" />
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne">Loading</p>
      </div>
    </div>
  )
}
