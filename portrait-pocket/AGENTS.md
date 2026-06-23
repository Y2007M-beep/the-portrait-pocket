# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Store Admin Prototype Notes

The private owner dashboard should live at `/admin` and stay out of the public storefront navigation. The current shop name is The Pocket Portrait, so admin surfaces should use "The Pocket Portrait Admin" even if older briefs mention The Portrait Pocket. Until real auth/backend exists, use mock data and a clearly marked prototype admin gate with TODO comments for owner/admin role auth. Keep the admin visually quieter and more operational than the public shop while reusing the brand palette: #cfcfa0, #e9ccd5, #b4d0d3, and #6d450a.

Store assumptions for admin mock data: Sweden only, SEK, 25% moms, PostNord shipping, 49 kr standard shipping, free shipping over 300 kr. Do not expose secret API keys, payment secrets, private tokens, or real customer payment details.
