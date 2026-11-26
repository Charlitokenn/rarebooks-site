// Types for the Starlight virtual modules the docs overrides import (spec 0024). Importing a part through
// `virtual:starlight/components/*` renders whichever component the config maps it to, so an override (our
// Pagination) is honored. Starlight declares these only in its internal typings, so the ones we use are
// declared here the same way, typed as Starlight's default component.

declare module "virtual:starlight/components/Search" {
  const Search: typeof import("@astrojs/starlight/components/Search.astro").default;
  export default Search;
}
declare module "virtual:starlight/components/SocialIcons" {
  const SocialIcons: typeof import("@astrojs/starlight/components/SocialIcons.astro").default;
  export default SocialIcons;
}
declare module "virtual:starlight/components/ThemeSelect" {
  const ThemeSelect: typeof import("@astrojs/starlight/components/ThemeSelect.astro").default;
  export default ThemeSelect;
}
declare module "virtual:starlight/components/EditLink" {
  const EditLink: typeof import("@astrojs/starlight/components/EditLink.astro").default;
  export default EditLink;
}
declare module "virtual:starlight/components/LastUpdated" {
  const LastUpdated: typeof import("@astrojs/starlight/components/LastUpdated.astro").default;
  export default LastUpdated;
}
declare module "virtual:starlight/components/Pagination" {
  const Pagination: typeof import("@astrojs/starlight/components/Pagination.astro").default;
  export default Pagination;
}
