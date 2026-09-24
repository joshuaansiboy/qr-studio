import { Header } from "@/components/qr-studio/header";
import { Workspace } from "@/components/qr-studio/workspace";

export default function Home() {
  return (
    <div className="page-wrap px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
      <div className="app-shell mx-auto w-full max-w-[1320px] overflow-hidden rounded-[22px] sm:rounded-[26px]">
        <Header />
        <main id="home" className="px-4 pb-8 pt-7 sm:px-8 sm:pt-9 lg:px-12 lg:pb-12">
          <div className="mb-6 sm:mb-7">
            <h1 className="text-[clamp(2rem,4.2vw,3.35rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[var(--text)]">
              Create Your <span className="text-[var(--blue)]">QR Code</span>
            </h1>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-[var(--muted)] sm:text-lg">
              Free, fast, and customizable. No account required.
            </p>
          </div>
          <Workspace />
        </main>
      </div>
      <footer className="mx-auto max-w-[1320px] px-4 pb-7 pt-4 text-sm text-[var(--muted)] sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-8">
          <section id="about" className="scroll-mt-8">
            <h2 className="font-semibold text-[var(--text)]">About QR Studio</h2>
            <p className="mt-1">Create and customize QR codes directly in your browser. No account or upload required.</p>
          </section>
          <section id="faq" className="scroll-mt-8">
            <h2 className="font-semibold text-[var(--text)]">FAQ</h2>
            <p className="mt-1">Do I need an account? No. Enter content above, then download or copy your QR code.</p>
          </section>
        </div>
      </footer>
    </div>
  );
}
