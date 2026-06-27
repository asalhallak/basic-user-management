/**
 * Angular browser bootstrap entry point.
 *
 * Loads polyfills, bootstraps `AppModule`, and stores the platform ref on `window.ngRef`
 * so hot module reload can destroy the previous instance before re-bootstrapping.
 *
 * @see docs/front-end-modules.md
 */
import './polyfills';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {
  // Ensure Angular destroys itself on hot reloads.
  if (window['ngRef']) {
    window['ngRef'].destroy();
  }
  window['ngRef'] = ref;

  // Otherwise, log the boot error
}).catch(err => console.error(err));
