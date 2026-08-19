type HeroSectionProps = {
  onGetStarted: () => void;
};

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="hero">
      <h1>Short links, big results</h1>

      <div className="heroCtas">
        <button className="primaryButton largeButton" onClick={onGetStarted}>
          Get started
        </button>
      </div>
    </section>
  );
}
