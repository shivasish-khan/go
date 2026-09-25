type HeroSectionProps = {
  onGetStarted: () => void;
};

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="hero">
      <h1>Short links, big results</h1>
      <p className="heroCopy">
        Paste a long URL below to get a short one in seconds. Sign in to add custom aliases,
        QR codes, and click analytics.
      </p>

      <div className="heroCtas">
        <button className="primaryButton largeButton" onClick={onGetStarted}>
          Get started
        </button>
        <a className="outlineButton largeButton anchorButton" href="#shorten">
          Shorten a link
        </a>
      </div>
    </section>
  );
}
