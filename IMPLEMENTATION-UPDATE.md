# Implementation update — November 2026

## Active application
The documented live application is served from `user/` and `admin/`. Both now load `shared/css/design-system.css` and use the same storefront brand palette (green `#13A653`, navy `#292477`, white surfaces and light neutral backgrounds), typography fallbacks and responsive image rules.

## Dealer applications
Website dealer applications continue to be stored as `type: "Dealer"` in the shared `enquiries` collection. The Admin → Customer Enquiries view now exposes call, WhatsApp and email actions, a dedicated **Approve dealer** action, and an **Approved** status. Status changes update the local shared store and are sent to the configured Google Apps Script endpoint when one is configured.

Approval records the decision on the application; it does not create a dealer login or automatically unlock wholesale prices. Those would require a separate authenticated dealer account and pricing policy.

## Language and wording
Tamil-script UI strings and sample backend catalogue translations in the active application were replaced with Kannada. Existing local SQLite databases also normalize the bundled sample category/product labels during initialization. The SQL database retains its legacy `name_ta` column name for compatibility with existing SQLite data files, but Kannada translations are stored in that field and user-facing exports identify it as Kannada.

Visible customer-facing wording now uses **enquiry / enquire**. Internal implementation identifiers such as `inquiryModal` remain unchanged to avoid breaking event wiring.

## Responsive and image behavior
The shared stylesheet prevents media overflow. User catalogue images use `object-fit: contain`; admin product cards, table thumbnails and search suggestions constrain images to their component boxes. Layouts and controls have mobile/tablet breakpoints, and enquiry tables scroll horizontally on narrow screens.

## Verification
JavaScript syntax checks, Python compilation and the backend test suite are run as part of the delivery checks.
