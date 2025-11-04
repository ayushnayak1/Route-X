import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer className="mt-12 bg-gradient-to-b from-muted/50 to-background" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
      <a href="#top" className="block w-full bg-secondary py-2 text-center text-sm hover:opacity-90">Back to top</a>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">About Route-X</a>
          <a href="#" className="hover:text-foreground">Help Center</a>
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
          <a href="#" className="hover:text-foreground">Terms of Service</a>
        </div>
        <motion.div className="mt-10 flex items-center justify-between border-t pt-6" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}>
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">RX</div>
            <span>Route-X</span>
          </div>
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Route-X. All rights reserved.</div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
