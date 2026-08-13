import { useCallback, useState } from "react"
export function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = "ok") => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800)
  }, [])
  return { toasts, add }
}
