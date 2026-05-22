# Route And UX Parity Notes

| Reference route or behavior | Prototype coverage | Evidence target |
| --- | --- | --- |
| `/` landing page | Preserves logo, nav labels, hero headline/subcopy, mode buttons, composer, features, gallery, pricing, about, and contact form | `docs/artifacts/prototype/prototype-home-desktop.png` |
| `Launch Beta` | Navigates to `/home/explore?category=latest`, matching observed production behavior | Playwright route smoke |
| `/home/explore` | App shell with Create, Explore, Collections, Subscriptions, Settings, Sign in; Explore heading; Latest/Trending tabs | Playwright route smoke |
| `/home/magick-chat` | Magick Friend composer, mode buttons, prompt tools, provider selector, ICP status strip, canister job creation, ad-credit grant recovery, and local worker completion evidence | Unit, Playwright, local asset-canister smoke, and advanced ICP smoke |
| `/home/collections` | Collections route with explicit privacy/publishing state | Manual/browser smoke |
| `/home/subscriptions` | Canister credit recovery paths for ICP top-up, subscription, ad credit, FreeLLMAPI, own provider, and local Ollama; ICP top-up creates a real payment intent | Manual/browser smoke and `local-icp-payment-intent-ui.png` |
| `/auth/sign-in` | Internet Identity and local signed browser identity; no credential fields | Unit and Playwright interaction tests |

Intentional differences:

- No production API, socket, auth provider, analytics, billing, database, or deployment target is connected.
- Creation writes local ICP canister job records after Internet Identity or local browser identity auth.
- Vite preview refuses to fake creation when no `ic_env` canister runtime is present.
- Gallery is a lighter horizontal media rail instead of the current heavy 3D dome because production emitted Three.js deprecation warnings and a resize observer null error.
- Visible copy uses ASCII hyphens in the prototype source to keep the new repo consistent and avoid encoding artifacts observed in terminal output.
