import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";

export function PaymentSheet({ open, onOpenChange, amount, onResult }: { open: boolean; onOpenChange: (v: boolean) => void; amount: number; onResult: (ok: boolean, paymentId?: string) => void }) {
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState<{ id: string } | null>(null);

  function pay() {
    setProcessing(true);
    setTimeout(() => {
      const ok = true; // simulate success
      const pid = `pay_${Math.random().toString(36).slice(2, 10)}`;
      setPaid(ok ? { id: pid } : null);
      setProcessing(false);
      onResult(ok, pid);
      if (ok) setTimeout(() => onOpenChange(false), 800);
    }, 1400);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete payment</DialogTitle>
          <DialogDescription>Securely pay to confirm your booking.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="text-sm">Amount payable: <span className="font-semibold">₹{amount}</span></div>
          <div>
            <Label className="mb-2 block">Method</Label>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as any)} className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem id="m-upi" value="upi" />
                <Label htmlFor="m-upi">UPI</Label>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem id="m-card" value="card" />
                <Label htmlFor="m-card">Card</Label>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem id="m-net" value="netbanking" />
                <Label htmlFor="m-net">Netbanking</Label>
              </div>
            </RadioGroup>
          </div>

          {method === "upi" && (
            <div className="grid gap-2">
              <Label htmlFor="upi">UPI ID</Label>
              <Input id="upi" placeholder="name@bank" />
            </div>
          )}
          {method === "card" && (
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label htmlFor="cardno">Card number</Label>
                <Input id="cardno" placeholder="1234 5678 9012 3456" />
              </div>
              <div>
                <Label htmlFor="exp">MM/YY</Label>
                <Input id="exp" placeholder="12/29" />
              </div>
              <div>
                <Label htmlFor="name">Name on card</Label>
                <Input id="name" placeholder="Full name" />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>
          )}
          {method === "netbanking" && (
            <div className="grid gap-2">
              <Label htmlFor="bank">Bank</Label>
              <Input id="bank" placeholder="Your bank name" />
            </div>
          )}

          {paid && (
            <div className="flex items-center gap-2 rounded-md border border-green-600/30 bg-green-500/10 p-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Payment successful · ID: {paid.id}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={processing}>Cancel</Button>
          <Button onClick={pay} disabled={processing}>
            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pay ₹{amount}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
