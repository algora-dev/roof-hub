'use client';

import { useEffect, useRef, useState } from 'react';
import type { EstimatorHandle, MountOptions } from './roofhub-types';

export type RoofHubEstimatorProps = {
  /** Same-origin directory containing src/ and assets/. */
  assetBase?: string;
  /** Memoise options in the parent. They initialise one mount, not controlled state. */
  options?: MountOptions;
  onReady?: (instance: EstimatorHandle) => void;
  className?: string;
};

/** Browser-loaded native module. Safe to render from an App Router server page. */
export default function RoofHubEstimator({
  assetBase = '/roofhub-estimator', options, onReady, className,
}: RoofHubEstimatorProps) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef({ options, onReady });
  latest.current = { options, onReady };
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let instance: EstimatorHandle | undefined;
    const element = host.current;
    setError('');
    async function start() {
      try {
        if (!element) return;
        const base = new URL(assetBase.replace(/\/$/, '') + '/', window.location.origin);
        if (base.origin !== window.location.origin) {
          throw new Error('Serve the estimator assets from this website’s own origin.');
        }
        const moduleUrl = new URL('src/index.mjs', base).href;
        const module = await import(/* webpackIgnore: true */ moduleUrl);
        if (cancelled) return;
        instance = module.mountRoofHub(element, latest.current.options) as EstimatorHandle;
        latest.current.onReady?.(instance);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'The estimator could not be loaded.');
      }
    }
    void start();
    return () => { cancelled = true; instance?.destroy(); };
  }, [assetBase]);

  return (
    <section className={className} aria-label="RoofHub detailed estimator">
      {error && <p role="alert">The estimator could not start. {error}</p>}
      <div ref={host} />
      <noscript>The interactive estimator requires JavaScript. Contact RoofHub for help with a quote.</noscript>
    </section>
  );
}
