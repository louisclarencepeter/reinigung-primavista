import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import Why from './components/Why.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import CookieConsent from './components/CookieConsent.jsx';

export default function App() {
  // localStorage can throw in private/restricted browsing contexts
  const [theme, setTheme] = useState(() => {
    try {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* not persistable — theme still applies for this visit */
    }
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    // Wait until the current effect flush has installed CookieConsent's
    // listeners. The guard also avoids replaying twice in StrictMode.
    queueMicrotask(() => {
      if (!mounted) return;
      window.__pvAppHydrated = true;
      const actions = window.__pvDeferredActions || [];
      window.__pvDeferredActions = [];
      for (const action of actions) {
        if (action === 'theme') setTheme((current) => current === 'dark' ? 'light' : 'dark');
        if (action === 'cookie-settings') window.dispatchEvent(new Event('open-cookie-consent'));
      }
    });
    return () => {
      mounted = false;
      window.__pvAppHydrated = false;
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + 'ms';
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#top">Zum Inhalt springen</a>
      <Header onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
      <main id="top" tabIndex={-1}>
        <Hero />
        <Services />
        <Why />
        <About />
        <Contact />
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}
