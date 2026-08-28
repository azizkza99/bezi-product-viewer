import { lazy, Suspense, useEffect, useState } from 'react'
import { content } from './content'

const ProductViewer = lazy(() => import('./ProductViewer'))

const defaults = {
  finish: 'oak',
  finishColor: '#a97849',
  handle: 'brass',
  handleColor: '#c9a45d',
  width: 90,
  height: 210,
  opening: 'left',
  angle: 22,
  exploded: false,
}

function getInitialLanguage() {
  try {
    return window.localStorage.getItem('form-language:v1') === 'en'
      ? 'en'
      : 'ar'
  } catch {
    return 'ar'
  }
}

function OptionGroup({ label, options, selected, onSelect }) {
  return (
    <fieldset className="control-group">
      <legend>{label}</legend>
      <div className="swatch-grid">
        {options.map((option) => (
          <button
            key={option.id}
            className="swatch-option"
            type="button"
            aria-pressed={selected === option.id}
            onClick={() => onSelect(option)}
          >
            <span
              className="swatch"
              style={{ '--swatch-color': option.color }}
              aria-hidden="true"
            />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function RangeControl({ label, value, min, max, step = 1, unit, onChange }) {
  return (
    <label className="range-control">
      <span className="range-label">
        <span>{label}</span>
        <output>
          {value} {unit}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function App() {
  const [language, setLanguage] = useState(getInitialLanguage)
  const [configuration, setConfiguration] = useState(defaults)
  const copy = content[language]
  const isArabic = language === 'ar'

  const selectedFinish = copy.finishes.find(
    (option) => option.id === configuration.finish,
  )
  const selectedHandle = copy.handles.find(
    (option) => option.id === configuration.handle,
  )
  const openingLabel =
    configuration.opening === 'left'
      ? copy.controls.left
      : copy.controls.right

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
    document.title = copy.meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', copy.meta.description)
    try {
      window.localStorage.setItem('form-language:v1', language)
    } catch {
      // The experience remains fully usable when storage is unavailable.
    }
  }, [copy.meta.description, copy.meta.title, isArabic, language])

  const updateConfiguration = (key, value) => {
    setConfiguration((current) => ({ ...current, [key]: value }))
  }

  const selectFinish = (option) => {
    setConfiguration((current) => ({
      ...current,
      finish: option.id,
      finishColor: option.color,
    }))
  }

  const selectHandle = (option) => {
    setConfiguration((current) => ({
      ...current,
      handle: option.id,
      handleColor: option.color,
    }))
  }

  const toggleLanguage = () => {
    setLanguage((current) => (current === 'ar' ? 'en' : 'ar'))
  }

  return (
    <>
      <a className="skip-link" href="#configurator">
        {isArabic ? 'انتقل إلى أداة المواصفات' : 'Skip to configurator'}
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label={copy.brandAria}>
          <span className="brand-mark" aria-hidden="true">
            F
          </span>
          <span>{copy.brand}</span>
        </a>
        <button
          className="language-toggle"
          type="button"
          aria-label={copy.languageLabel}
          onClick={toggleLanguage}
        >
          <span aria-hidden="true">{isArabic ? 'EN' : 'ع'}</span>
          {copy.language}
        </button>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="hero-title">{copy.title}</h1>
            <p className="hero-description">{copy.description}</p>
            <p className="trust-line">
              <span aria-hidden="true" />
              {copy.trust}
            </p>
          </div>
          <div className="hero-index" aria-hidden="true">
            <span>01</span>
            <span>PRODUCT SYSTEM</span>
          </div>
        </section>

        <section
          className="configurator-shell"
          id="configurator"
          aria-label={copy.controls.title}
        >
          <div className="viewer-panel">
            <div className="viewer-toolbar">
              <span className="sample-badge">{copy.sample}</span>
              <span>{copy.viewerHint}</span>
            </div>
            <Suspense
              fallback={
                <div className="viewer-canvas viewer-loading" role="status">
                  <span aria-hidden="true" />
                  <p>{copy.viewerLoading}</p>
                </div>
              }
            >
              <ProductViewer
                config={configuration}
                label={copy.viewerLabel}
                unavailableLabel={copy.viewerUnavailable}
              />
            </Suspense>
            <div className="dimension-readout" aria-hidden="true">
              <span>{configuration.height} cm</span>
              <span>
                {configuration.width} cm · {configuration.angle}°
              </span>
            </div>
          </div>

          <aside className="control-panel" aria-labelledby="controls-title">
            <div className="panel-heading">
              <p className="section-number">02 / CONFIGURE</p>
              <h2 id="controls-title">{copy.controls.title}</h2>
              <p>{copy.controls.description}</p>
            </div>

            <OptionGroup
              label={copy.controls.finish}
              options={copy.finishes}
              selected={configuration.finish}
              onSelect={selectFinish}
            />

            <OptionGroup
              label={copy.controls.handle}
              options={copy.handles}
              selected={configuration.handle}
              onSelect={selectHandle}
            />

            <div className="range-grid">
              <RangeControl
                label={copy.controls.width}
                value={configuration.width}
                min={70}
                max={120}
                unit="cm"
                onChange={(value) => updateConfiguration('width', value)}
              />
              <RangeControl
                label={copy.controls.height}
                value={configuration.height}
                min={190}
                max={250}
                unit="cm"
                onChange={(value) => updateConfiguration('height', value)}
              />
            </div>

            <fieldset className="control-group">
              <legend>{copy.controls.opening}</legend>
              <div className="segmented-control">
                {['left', 'right'].map((side) => (
                  <button
                    key={side}
                    type="button"
                    aria-pressed={configuration.opening === side}
                    onClick={() => updateConfiguration('opening', side)}
                  >
                    {side === 'left'
                      ? copy.controls.left
                      : copy.controls.right}
                  </button>
                ))}
              </div>
            </fieldset>

            <RangeControl
              label={copy.controls.angle}
              value={configuration.angle}
              min={0}
              max={110}
              step={2}
              unit="°"
              onChange={(value) => updateConfiguration('angle', value)}
            />

            <label className="switch-row">
              <span>{copy.controls.exploded}</span>
              <input
                type="checkbox"
                checked={configuration.exploded}
                onChange={(event) =>
                  updateConfiguration('exploded', event.target.checked)
                }
              />
              <span className="switch" aria-hidden="true" />
            </label>

            <button
              className="reset-button"
              type="button"
              onClick={() => setConfiguration(defaults)}
            >
              {copy.controls.reset}
            </button>
          </aside>
        </section>

        <section className="specification" aria-labelledby="summary-title">
          <div className="summary-heading">
            <p className="eyebrow">{copy.summary.eyebrow}</p>
            <h2 id="summary-title">{copy.summary.title}</h2>
          </div>
          <dl className="spec-grid" aria-live="polite">
            <div>
              <dt>{copy.summary.dimension}</dt>
              <dd>
                {configuration.width} × {configuration.height} cm
              </dd>
            </div>
            <div>
              <dt>{copy.summary.finish}</dt>
              <dd>{selectedFinish?.label}</dd>
            </div>
            <div>
              <dt>{copy.summary.handle}</dt>
              <dd>{selectedHandle?.label}</dd>
            </div>
            <div>
              <dt>{copy.summary.opening}</dt>
              <dd>{openingLabel}</dd>
            </div>
            <div>
              <dt>{copy.controls.angle}</dt>
              <dd>{configuration.angle}°</dd>
            </div>
            <div>
              <dt>{copy.summary.state}</dt>
              <dd>
                {configuration.exploded
                  ? copy.summary.exploded
                  : copy.summary.assembled}
              </dd>
            </div>
          </dl>
          <p className="summary-note">{copy.summary.note}</p>
        </section>
      </main>

      <footer>
        <span className="brand-mark footer-mark" aria-hidden="true">
          F
        </span>
        <p>{copy.footer}</p>
        <span>© {new Date().getFullYear()} FORM CONCEPT</span>
      </footer>
    </>
  )
}

export default App
