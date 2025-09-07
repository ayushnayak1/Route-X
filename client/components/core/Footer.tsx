import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer className="mt-12 bg-gradient-to-b from-muted/50 to-background" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
      <a href="#top" className="block w-full bg-secondary py-2 text-center text-sm hover:opacity-90">Back to top</a>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="text-sm font-semibold">Get to Know Us</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About Route-X</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
              <li><a href="#" className="hover:text-foreground">Press Releases</a></li>
              <li><a href="#" className="hover:text-foreground">Sustainability</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Connect with Us</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Twitter / X</a></li>
              <li><a href="#" className="hover:text-foreground">Instagram</a></li>
              <li><a href="#" className="hover:text-foreground">LinkedIn</a></li>
              <li><a href="#" className="hover:text-foreground">YouTube</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Make Money with Us</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Drive with Route-X</a></li>
              <li><a href="#" className="hover:text-foreground">Partner Bus Operators</a></li>
              <li><a href="#" className="hover:text-foreground">Advertise your route</a></li>
              <li><a href="#" className="hover:text-foreground">Developers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Let Us Help You</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Your Account</a></li>
              <li><a href="#" className="hover:text-foreground">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
            </ul>
          </div>
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
