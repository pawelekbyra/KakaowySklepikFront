# Vercel status

## 2026-07-06

Status: not connected / not verified.

Current observation:

- The Vercel deployment for this frontend currently renders a Spree Admin style login panel at `/login`.
- The login form shows `Spree Admin` and asks for an admin email/password.
- The admin credentials that were prepared during backend work do not work on this Vercel login screen.
- The screen reports invalid email or password.
- This is not yet confirmed to be connected to the Render Spree backend.

Environment variables added in Vercel:

```env
SPREE_API_URL=https://kakaowy-sklepik.onrender.com
SPREE_PUBLISHABLE_KEY=<configured in Vercel, value not committed>
NEXT_PUBLIC_SITE_URL=https://sklepikkk.vercel.app
```

Notes:

- The exact publishable key value is intentionally not written into this repository.
- It is not yet confirmed that the variables were added to the correct Vercel environment and deployment target.
- It is not yet confirmed that the current frontend code actually consumes these variables to call the Spree Store API.
- It is not yet confirmed that the `/login` screen should exist in the customer storefront.

Next checks:

1. Verify in Vercel that these variables exist for the active deployment environment.
2. Redeploy after setting the variables.
3. Inspect the frontend code path that renders `/login`.
4. Confirm whether this project is intended to be a customer storefront or an admin/dashboard interface.
5. Confirm that Store API calls are made to `https://kakaowy-sklepik.onrender.com` with the publishable key.
