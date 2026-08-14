export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__brand">
          

          <a
            href="https://www.instagram.com/nickwhittaker.oceanimagery/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="social"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>

        <address>
          <a href="mailto:order@nickwhittakerimagery.com">order@nickwhittakerimagery.com</a>
          <a href="tel:+6421507507">+64 21 507 507</a>
        </address>

        <div>&copy; {new Date().getFullYear()} Nick Whittaker Imagery</div>
      </div>
    </footer>
  );
}
