'use client';

import { useEffect, useRef, useState } from 'react';
import type { EnquiryPayload, EstimatorHandle, MountOptions } from './roofhub-types';
import { trackRoofHubEvent } from '@/lib/client/analytics';
import { getRoofProject, setRoofProject } from '@/lib/client/roof-project-store';
import { registerToolContext, setToolContext } from '@/lib/client/tool-context-store';
import { loadDetailedEstimatorModule } from '@/lib/estimator/detailed-adapter';
import { sharedProjectFromDetailedProject } from '@/lib/estimator/project-adapter';
import { detailedProjectFromQuickProject } from '@/lib/quick-estimate/project-adapter';

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
  const [quickImport, setQuickImport] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let instance: EstimatorHandle | undefined;
    const element = host.current;
    const unregisterContext = registerToolContext('detailed-estimate');
    setError('');
    trackRoofHubEvent('advanced_estimator_open', { tool: 'detailed-estimate' });

    async function start() {
      try {
        if (!element) return;
        const module = await loadDetailedEstimatorModule(assetBase);
        if (cancelled) return;
        const sendQuoteRequest = async (payload: EnquiryPayload) => {
          const response = await fetch('/api/enquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind: 'quote', payload })
          });
          const result = await response.json();
          return { ok: response.ok && result.ok === true, reference: result.reference };
        };
        const hostOnProjectChange = latest.current.options?.onProjectChange;
        const onProjectChange: NonNullable<MountOptions['onProjectChange']> = (project) => {
          try {
            const estimate = module.calculateEstimate(project);
            const shared = sharedProjectFromDetailedProject(project, estimate.ok ? estimate : null, getRoofProject());
            setRoofProject(shared);
            setToolContext({ activeTool: 'detailed-estimate', step: String(project.step) });
          } catch {
            // Shared session state must not interrupt the detailed estimator.
          }
          hostOnProjectChange?.(project);
        };
        const sharedBeforeMount = getRoofProject();
        const importRequested = new URL(window.location.href).searchParams.get('from') === 'quick-estimate';
        const quickInitialProject = importRequested && sharedBeforeMount
          ? detailedProjectFromQuickProject(sharedBeforeMount, module)
          : null;
        const mountOptions: MountOptions = {
          ...latest.current.options,
          initialProject: latest.current.options?.initialProject ?? quickInitialProject ?? undefined,
          privacyUrl: latest.current.options?.privacyUrl ?? '/privacy',
          onProjectChange,
          onQuoteRequest: latest.current.options?.onQuoteRequest ?? sendQuoteRequest
        };
        instance = module.mountRoofHub(element, mountOptions);
        if (quickInitialProject) setQuickImport(true);
        latest.current.onReady?.(instance);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'The estimator could not be loaded.');
      }
    }
    void start();
    return () => {
      cancelled = true;
      unregisterContext();
      instance?.destroy();
    };
  }, [assetBase]);

  return (
    <section className={className} aria-label="RoofHub detailed estimator">
      {quickImport && <div className="rh-quick-import"><strong>Approximate Quick Estimate measurements loaded.</strong><span>Review and replace them with actual measurements wherever you can. They are marked as estimated and are not a measured takeoff.</span></div>}
      {error && <p role="alert">The estimator could not start. {error}</p>}
      <div ref={host} />
      <noscript>The interactive estimator requires JavaScript. Contact RoofHub for help with a quote.</noscript>
    </section>
  );
}
