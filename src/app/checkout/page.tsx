"use client";
import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, CheckCircle2, CreditCard, Wallet, Truck, Gift, Landmark, Loader2, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/layout";
import { Button, Field } from "@/components/ui";
import { Modal } from "@/components/feedback";
import { useStore } from "@/lib/store";
import { demoFetch, discountPercent, notify, type DemoOrder } from "@/lib/demo";

const shippingOptions = [
  {id:"standard",name:"Standard delivery",desc:"3?5 days ? Free over $50 after discounts",price:10,icon:Truck},
  {id:"express",name:"Express delivery",desc:"1?2 days ? Priority service",price:18,icon:Truck},
  {id:"gift",name:"Gift concierge",desc:"Gift wrap, a card and fragrance samples",price:14,icon:Gift},
];
const paymentOptions = [
  {id:"card",name:"Demo card",desc:"Simulate a card payment",icon:CreditCard},
  {id:"paypal",name:"Demo PayPal",desc:"Simulated approval ? No sign-in required",icon:Wallet},
  {id:"cod",name:"Cash on delivery",desc:"Demo delivery within Mogadishu",icon:Landmark},
];
function CheckoutInner() {
  const sp = useSearchParams();
  const {cart,subtotal,refresh,loading} = useStore();
  const [step,setStep] = useState(1);
  const [placing,setPlacing] = useState(false);
  const locked = useRef(false);
  const [order,setOrder] = useState<DemoOrder|null>(null);
  const [showSuccess,setShowSuccess] = useState(false);
  const [error,setError] = useState("");
  const [code,setCode] = useState(sp.get("code") || "");
  const [applied,setApplied] = useState(discountPercent(sp.get("code") || "") ? (sp.get("code") || "").toUpperCase() : "");
  const [ship,setShip] = useState("standard");
  const [pay,setPay] = useState("card");
  const [outcome,setOutcome] = useState("success");
  const [f,setF] = useState({email:"",firstName:"",lastName:"",address:"",city:"",zip:"",country:"Somalia",phone:""});
  const formRef = useRef<HTMLFormElement>(null);
  const discount = Math.round(subtotal*discountPercent(applied)/100);
  const shipping = !subtotal ? 0 : ship === "standard" ? subtotal-discount >= 50 ? 0 : 10 : ship === "express" ? 18 : 14;
  const total = subtotal-discount+shipping;
  const update = (key:string,value:string) => setF(previous => ({...previous,[key]:value}));
  function apply() {
    if (!code.trim()) {setApplied("");notify("Discount removed.","info");return;}
    if (!discountPercent(code)) {notify("Invalid code. Try ABOOSTO15 for 15% off.","error");return;}
    setApplied(code.trim().toUpperCase());notify("Discount applied.");
  }
  async function place() {
    if (locked.current || order) return;
    if (!f.email || !f.firstName.trim() || !f.address.trim() || !f.city.trim() || !f.country.trim()) {
      setStep(1);setError("Please complete your contact and delivery details.");notify("Complete your contact and delivery details.","error");return;
    }
    locked.current = true;setPlacing(true);setError("");
    try {
      await new Promise(resolve => setTimeout(resolve,900));
      const response = await demoFetch("/api/orders",{method:"POST",body:JSON.stringify({...f,shippingMethod:ship,paymentMethod:pay,discountCode:applied,demoCard:true,outcome:pay === "cod" ? "success" : outcome})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOrder(data.order);setShowSuccess(true);await refresh();
    } catch (error) {setError(error instanceof Error ? error.message : "Unable to complete your demo order.");}
    finally {locked.current=false;setPlacing(false);}
  }
  if (loading) return <div className="p-16 text-center">Preparing your bag?</div>;
  if (!cart.length && !order) return <div className="max-w-xl mx-auto text-center py-24 px-6"><h1 className="font-serif text-3xl">Your bag is empty</h1><p className="mt-3 text-[#8a767e]">Add a fragrance to try the demo checkout.</p><Link href="/shop" className="inline-block mt-6 rounded-full bg-[#520a22] text-white px-7 py-3">Explore fragrances</Link></div>;
  return <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-7 pb-16">
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Cart",href:"/cart"},{label:"Checkout"}]}/>
    <h1 className="font-serif text-3xl sm:text-4xl mt-3">A beautiful ritual awaits.</h1>
    <p className="mt-3 rounded-xl border border-[#c9a24b]/30 bg-[#fff9f1] p-4 text-sm text-[#79644c]">Interactive demo ? No real payment, email or delivery. Use sample details to explore checkout.</p>
    {order ? <div className="mt-8 bg-white luxury-card rounded-2xl p-8 text-center"><CheckCircle2 size={42} className="mx-auto text-emerald-700"/><h2 className="font-serif text-2xl mt-3">Your demo order is confirmed</h2><Link href={"/success?order="+order.id} className="inline-block mt-5 rounded-full bg-[#520a22] text-white px-7 py-3">View receipt</Link></div> :
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-7 mt-7 items-start">
      <form ref={formRef} onSubmit={e => {e.preventDefault();if(step<3) {setStep(step+1);setError("");} else void place();}} className="bg-white luxury-card rounded-[24px] p-5 sm:p-8 min-w-0">
        <nav aria-label="Checkout progress" className="flex gap-2 mb-8">
          {["Details","Delivery","Payment"].map((label,i) => <button type="button" key={label} disabled={i+1>step || placing} onClick={() => setStep(i+1)} aria-current={step===i+1 ? "step" : undefined} className={"flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm " + (step===i+1 ? "bg-[#520a22] text-white" : "bg-[#faf0f2] text-[#796970]")}><span>{step>i+1 ? <Check size={15}/> : i+1}</span>{label}</button>)}
        </nav>
        {step===1 && <div className="fade-up"><div className="flex flex-wrap justify-between items-center gap-3 mb-5"><h2 className="font-serif text-2xl">Contact & delivery</h2><Button type="button" size="sm" variant="outline" onClick={() => {setF({email:"amira@example.com",firstName:"Amira",lastName:"Hassan",address:"12 Fragrance Lane",city:"Mogadishu",country:"Somalia",phone:"+252610000000",zip:"00252"});notify("Sample details filled.");}}>Use demo details</Button></div>
          <div className="grid sm:grid-cols-2 gap-4">{([{key:"email",label:"Email",type:"email",required:true},{key:"firstName",label:"First name",required:true},{key:"lastName",label:"Last name"},{key:"phone",label:"Phone",type:"tel"},{key:"address",label:"Street address",required:true},{key:"city",label:"City",required:true},{key:"country",label:"Country",required:true},{key:"zip",label:"Postal code"}] as const).map(field => <Field key={field.key} label={field.label}><input className="lux-input" type={"type" in field ? field.type : "text"} required={"required" in field && field.required} value={f[field.key]} onChange={e => update(field.key,e.target.value)} autoComplete="off"/></Field>)}</div>
        </div>}
        {step===2 && <div className="fade-up"><h2 className="font-serif text-2xl mb-5">Choose your delivery</h2><div className="space-y-3">{shippingOptions.map(option => <label key={option.id} className={"flex gap-3 items-center rounded-2xl border p-4 cursor-pointer " + (ship===option.id ? "border-[#520a22] bg-[#faf0f2]" : "border-[#520a22]/15")}><input type="radio" name="shipping" checked={ship===option.id} onChange={() => setShip(option.id)} className="accent-[#520a22]"/><option.icon size={21} className="shrink-0 text-[#520a22]"/><span className="flex-1"><span className="block text-sm font-semibold">{option.name}</span><span className="text-xs text-[#8a767e]">{option.desc}</span></span><span className="text-sm">{option.id==="standard" && subtotal-discount>=50 ? "Free" : "$"+option.price}</span></label>)}</div></div>}
        {step===3 && <div className="fade-up"><h2 className="font-serif text-2xl mb-5">Try a demo payment</h2><div className="space-y-3">{paymentOptions.map(option => <label key={option.id} className={"flex items-center gap-3 border rounded-2xl p-4 cursor-pointer " + (pay===option.id ? "border-[#520a22] bg-[#faf0f2]" : "border-[#520a22]/15")}><input type="radio" name="payment" checked={pay===option.id} onChange={() => {setPay(option.id);setError("");}} className="accent-[#520a22]"/><option.icon size={21} className="shrink-0 text-[#520a22]"/><span><span className="block text-sm font-semibold">{option.name}</span><span className="text-xs text-[#8a767e]">{option.desc}</span></span></label>)}</div>
          {pay==="card" && <div className="burgundy-gradient rounded-2xl p-5 text-white mt-5"><CreditCard size={25}/><p className="tracking-[0.2em] mt-4">4242 4242 4242 4242</p><div className="flex justify-between mt-4 text-xs text-white/70"><span>ABOOSTO DEMO</span><span>12/30 ? CVC 123</span></div><p className="text-xs mt-3 text-[#e6c988]">Sample card selected. No card details are collected.</p></div>}
          {pay!=="cod" && <Field label="Payment simulation" className="mt-5"><select aria-label="Payment simulation" value={outcome} onChange={e => {setOutcome(e.target.value);setError("");}} className="lux-input"><option value="success">Successful payment</option><option value="declined">Declined payment ? test retry</option></select></Field>}
          <div className="mt-5 rounded-xl bg-[#fff9f1] p-4 text-sm"><p className="font-semibold">Deliver to {f.firstName} {f.lastName}</p><p className="text-[#8a767e] mt-1">{f.address}, {f.city}, {f.country}</p><button type="button" onClick={() => setStep(1)} className="text-[#520a22] underline mt-2">Edit delivery details</button></div>
        </div>}
        {error && <p role="alert" className="mt-5 text-sm text-red-800 border border-red-200 bg-red-50 rounded-xl p-4">{error}</p>}
        <div className="flex justify-between gap-3 mt-7">{step>1 && <Button type="button" variant="outline" disabled={placing} onClick={() => setStep(step-1)}>Back</Button>}<Button type="submit" className="ml-auto" disabled={placing}>{placing ? <><Loader2 size={17} className="animate-spin"/>Processing?</> : step<3 ? <>Continue <ArrowRight size={16}/></> : pay==="cod" ? "Place demo order" : "Simulate payment ? $"+total}</Button></div>
      </form>
      <aside className="bg-white luxury-card rounded-[24px] p-6 lg:sticky lg:top-24 min-w-0">
        <h2 className="font-serif text-2xl">Your ritual</h2><div className="space-y-4 mt-5">{cart.map(line => <div key={line.id} className="flex items-center gap-3"><img src={line.image} alt={line.name} className="w-14 h-16 rounded-xl object-cover"/><div className="flex-1 min-w-0"><p className="text-sm font-medium">{line.name}</p><p className="text-xs text-[#8a767e]">{line.size} ? Qty {line.qty}</p></div><span className="text-sm">${line.price*line.qty}</span></div>)}</div>
        <div className="flex gap-2 mt-6"><input aria-label="Discount code" className="lux-input min-w-0" value={code} onChange={e=>setCode(e.target.value)} placeholder="ABOOSTO15"/><Button onClick={apply} size="sm" variant="outline">Apply</Button></div>{applied && <button onClick={()=>{setApplied("");setCode("");notify("Discount removed.","info");}} className="text-xs text-emerald-700 mt-2">{applied} applied ? Remove</button>}
        <div className="space-y-3 border-t border-[#520a22]/10 mt-6 pt-5 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>${subtotal}</span></p><p className="flex justify-between"><span>Discount</span><span>?${discount}</span></p><p className="flex justify-between"><span>Delivery</span><span>{shipping ? "$"+shipping : "Free"}</span></p><p className="flex justify-between font-semibold text-xl text-[#520a22]"><span>Total</span><span>${total}</span></p></div>
        <Link href="/cart" className="inline-block underline text-sm text-[#8a767e] mt-5">Edit your bag</Link>
      </aside>
    </div>}
    {showSuccess && order && <Modal title="Your ritual is confirmed" onClose={()=>setShowSuccess(false)}><div className="text-center"><span className="success-bloom mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={42}/></span><p className="font-serif text-3xl mt-5">Thank you, {order.firstName}.</p><p className="text-sm text-[#8a767e] mt-3">Demo order #{order.id.slice(0,8).toUpperCase()} ? ${order.total}</p><p className="text-sm text-[#8a767e] mt-2">Saved in your account. No payment was charged.</p><Link href={"/success?order="+order.id} className="block rounded-full bg-[#520a22] text-white p-3 mt-6">View order receipt</Link><Link href="/shop" className="inline-block underline text-sm mt-4 text-[#520a22]">Continue shopping</Link></div></Modal>}
  </div>;
}
export default function CheckoutPage() {return <Suspense fallback={<div className="p-16 text-center">Preparing checkout?</div>}><CheckoutInner/></Suspense>;}
