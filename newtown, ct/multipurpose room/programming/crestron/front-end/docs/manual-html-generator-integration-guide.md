# Manual HTML generator — integration guide for chat agents

**Purpose:** Instructions for an application that generates `manual.html` so it works with the Crestron room-control UI **Help** feature via **same-window navigation** (not iframe).

**Audience:** Another coding agent or developer maintaining the manual generator. Self-contained; no access to the control UI repo required beyond the requirements below.

---

## 1. Context — how the control UI loads the manual

The Crestron control application exposes a **Help** button in the bottom navigation.

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Local manual** | Crestron serial join **21** (`localURL`) is non-empty | **Navigates the entire browser** to the manual URL. Control UI unloads. User returns via a **Back to controls** button on the manual. |
| **Host manual** | Serial join **22** (`hostURL`) only | QR code dialog for scanning on a phone (unrelated to `manual.html` navigation). |

If both joins are set, **local wins**.

### Typical deployment

- Control UI: `https://<PROCESSOR_IP>/system/index.html`
- Manual: `/html/manual.html` on the processor (or absolute URL)
- Crestron serial join 21: **`/html/manual.html`** (relative path recommended when manual is on the processor)

**No iframe, no CSP `frame-ancestors`, and no `X-Frame-Options` changes are required** for this navigation model.

---

## 2. Required: Back to controls button

When Help is tapped, the control app navigates away and appends a query parameter with the UI URL the user came from:

```text
/html/manual.html?returnUrl=https%3A%2F%2F172.21.100.151%2Fsystem%2Findex.html
```

The same URL is stored in `sessionStorage` under key `visionpoint.helpReturnUrl` when parent and manual are **same origin** (e.g. both on the processor).

### Task A — Add a visible Back to controls control

Every generated `manual.html` must include a prominent button or link that returns the user to the control UI.

**Primary implementation (works cross-origin and same-origin):**

```html
<button type="button" id="back-to-controls">Back to controls</button>
<script>
(function () {
  var params = new URLSearchParams(window.location.search);
  var returnUrl = params.get('returnUrl');
  if (!returnUrl) {
    try {
      returnUrl = sessionStorage.getItem('visionpoint.helpReturnUrl');
    } catch (e) {}
  }
  var btn = document.getElementById('back-to-controls');
  if (btn && returnUrl) {
    btn.addEventListener('click', function () {
      window.location.assign(returnUrl);
    });
  } else if (btn) {
    btn.hidden = true;
  }
})();
</script>
```

**Requirements:**

- Label clearly: **Back to controls** (or equivalent)
- Large enough for touch panels
- Fixed position (e.g. top-right) recommended so it stays visible while scrolling
- Hide the button if no `returnUrl` is available (manual opened directly in a tab)

### Task B — Do not rely on browser Back alone

Crestron touch panels often lack an obvious browser back control. The in-page button is required for good UX.

---

## 3. URL and deployment

| Setting | Value |
|---------|--------|
| Deploy path | `/html/manual.html` on processor web root |
| Crestron serial join 21 | `/html/manual.html` or full URL |
| Assets | Relative paths under `/html/` (e.g. `./images/logo.png`) |

The control UI resolves relative join-21 paths to the processor hostname when the UI is not served from that host (e.g. localhost dev).

---

## 4. HTML template skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Room Manual</title>
  <style>
    #back-to-controls {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      padding: 12px 20px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <button type="button" id="back-to-controls">Back to controls</button>
  <!-- manual content -->
  <script>
  (function () {
    var params = new URLSearchParams(window.location.search);
    var returnUrl = params.get('returnUrl');
    if (!returnUrl) {
      try { returnUrl = sessionStorage.getItem('visionpoint.helpReturnUrl'); } catch (e) {}
    }
    var btn = document.getElementById('back-to-controls');
    if (btn && returnUrl) {
      btn.addEventListener('click', function () { window.location.assign(returnUrl); });
    } else if (btn) {
      btn.hidden = true;
    }
  })();
  </script>
</body>
</html>
```

---

## 5. What is NOT required (navigation model)

- CSP `frame-ancestors` meta tags for embedding
- Per-room processor hostnames in manual HTML
- `X-Frame-Options` changes on Crestron webserver
- In-app Close button (control UI provides navigation only on the way in; manual provides back on the way out)

---

## 6. Tradeoffs integrators should know

Returning to the control UI **reloads the entire React application** (WebXPanel reconnect, etc.). This can take several seconds on a touch panel. That is expected with full-page navigation.

---

## 7. Acceptance criteria

1. From control UI, tap **Help** → browser navigates to manual with `?returnUrl=` in the address bar.
2. Manual shows **Back to controls** button.
3. Tap **Back to controls** → returns to the exact control UI URL from `returnUrl`.
4. Opening manual directly in a tab (no query param) → back button hidden or absent.

---

## 8. Checklist for the generator agent

- [ ] Add **Back to controls** button wired to `returnUrl` query param (fallback: `sessionStorage` key `visionpoint.helpReturnUrl`)
- [ ] Touch-friendly styling for the back button
- [ ] Document deploy path `/html/manual.html` and serial join 21
- [ ] Do **not** add iframe/CSP embedding configuration
- [ ] Use relative asset paths under `/html/`

---

## 9. Constants (must match control UI)

| Name | Value |
|------|--------|
| Query parameter | `returnUrl` |
| sessionStorage key | `visionpoint.helpReturnUrl` |
