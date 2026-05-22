# Route And UX Parity Notes

| Reference route or behavior | Prototype coverage | Evidence target |
| --- | --- | --- |
| `/` landing page | Preserves logo, nav labels, hero headline/subcopy, mode buttons, composer, features, gallery, pricing, about, and contact form | `docs/artifacts/prototype/prototype-home-desktop.png` |
| `Launch Beta` | Navigates to `/home/explore?category=latest`, matching observed production behavior | Playwright route smoke |
| `/home/explore` | App shell with Create, Explore, Collections, Subscriptions, Settings, Sign in; Explore heading; Latest/Trending tabs | Playwright route smoke |
| `/home/magick-chat` | Magick Friend composer, mode buttons, prompt tools, local queued status | Unit and Playwright interaction tests |
| `/home/collections` | Collections route and privacy/publishing state placeholder | Manual/browser smoke |
| `/home/subscriptions` | Plan comparison and disabled purchase CTAs to avoid billing side effects | Manual/browser smoke |
| `/auth/sign-in` | Non-production auth layout only; credentials are never sent | Manual/browser smoke |

Intentional differences:

- No production API, socket, auth provider, analytics, billing, database, or deployment target is connected.
- Creation output is local mock state only.
- Gallery is a lighter horizontal media rail instead of the current heavy 3D dome because production emitted Three.js deprecation warnings and a resize observer null error.
- Visible copy uses ASCII hyphens in the prototype source to keep the new repo consistent and avoid encoding artifacts observed in terminal output.
