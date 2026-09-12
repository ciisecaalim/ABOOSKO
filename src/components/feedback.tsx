"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({title, children, onClose, variant}: {title:string; children:ReactNode; onClose:()=>void; variant?:"drawer"}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = old; previous?.focus(); };
  }, []);
  return createPortal(<dialog ref={ref} className={"demo-modal" + (variant === "drawer" ? " demo-drawer" : "")} aria-label={title} onCancel={e => {e.preventDefault();onClose();}} onClick={e => {if(e.target === e.currentTarget) onClose();}}>
    <div className="relative p-6 sm:p-8">
      <button autoFocus onClick={onClose} aria-label="Close dialog" className="absolute top-4 right-4 rounded-full p-2 hover:bg-[#faf0f2]"><X size={20}/></button>
      <h2 className="font-serif text-2xl text-[#520a22] pr-9">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  </dialog>, document.body);
}

export function Feedback() {
  const [toasts,setToasts] = useState<{id:number;message:string;kind:"success"|"error"|"info"}[]>([]);
  const sequence = useRef(0);
  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const listener = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const id = ++sequence.current;
      setToasts(previous => [...previous.slice(-2),{...detail,id}]);
      const timer = setTimeout(() => {setToasts(previous => previous.filter(t => t.id !== id));timers.delete(timer);},5500);
      timers.add(timer);
    };
    window.addEventListener("aboosto:toast",listener);
    return () => {window.removeEventListener("aboosto:toast",listener);timers.forEach(clearTimeout);};
  },[]);
  return <div className="toast-stack" aria-live="polite" aria-atomic="false">{toasts.map(t => <div key={t.id} role={t.kind === "error" ? "alert" : "status"} className={"demo-toast " + t.kind}>
    {t.kind === "success" ? <CheckCircle2 className="shrink-0 text-emerald-700" size={22}/> : t.kind === "error" ? <AlertCircle className="shrink-0 text-red-700" size={22}/> : <Info className="shrink-0" size={22}/>}
    <p className="flex-1 text-sm">{t.message}</p><button aria-label="Dismiss notification" onClick={() => setToasts(previous => previous.filter(x => x.id !== t.id))} className="p-1"><X size={16}/></button>
  </div>)}</div>;
}
