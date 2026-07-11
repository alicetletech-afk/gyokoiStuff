GYOKOI HUB — QUICK START

1. Create a new GitHub repository.
2. Upload these files to the root:
   - index.html
   - style.css
   - apps.js
   - script.js
3. Enable GitHub Pages:
   Settings → Pages → Deploy from branch → main / root
4. Open the generated GitHub Pages URL.

TO ADD OR EDIT APPS
Open apps.js and add/edit one object inside APPS.

Example:
{
  id: "new-app",
  title: "New App",
  description: "Short description",
  category: "work",
  categoryLabel: "Work Tool",
  status: "live",
  icon: "N",
  color: "#4f8cff",
  url: "https://example.com/"
}

Supported categories:
- personal
- work
- business
- internal

Supported statuses:
- live
- demo
- internal
- building

This version is frontend-only. CMS can be added later without redesigning the page.
