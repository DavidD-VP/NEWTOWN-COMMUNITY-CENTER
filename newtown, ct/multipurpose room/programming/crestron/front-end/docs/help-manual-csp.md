# Help manual — integrator notes



The local Help manual uses **same-window navigation** (not iframe). CSP and `X-Frame-Options` changes on `manual.html` are **not required** for Help to work.



For **manual.html generator** requirements (back button, `returnUrl`), see **`manual-html-generator-integration-guide.md`**.



---



## Behavior



- Serial join **21** (`localURL`): Help navigates the browser to the manual; appends `?returnUrl=<encoded UI URL>`.

- Serial join **22** (`hostURL`): QR dialog only.

- Manual must implement **Back to controls** using the `returnUrl` query parameter.



---



## Deployment



- Prefer relative path on join 21: `/html/manual.html`

- Manual and UI can be on different hosts (panel vs processor); navigation avoids iframe cross-origin issues.

- Returning to the UI reloads the control app (expected).



---



## CP4N console errors (HTTPS)



When loading the control UI over **HTTPS** (e.g. `https://172.21.100.151/system/`), the Crestron web server sends a `Content-Security-Policy` **HTTP response header**. This is **not** in `index.html` from the CH5 build.



### `frame-ancestors` errors (red)



Example console errors:



```text
The Content-Security-Policy directive 'frame-ancestors' does not support the source expression 'https://.21.100.151'
The Content-Security-Policy directive 'frame-ancestors' does not support the source expression 'https://172.21.100.151'
```



**Cause:** The CP4N HTTPS web server adds extra hosts to the `frame-ancestors` CSP directive. When the processor IP is added, firmware may also emit truncated fragments (`https://.21.100.151`, `https://00.151`). Browsers reject those invalid sources and log red console errors. IP literals in `frame-ancestors` are also rejected by some browsers.



**Observed bad header** (example from `https://172.21.100.151/system/index.html`):



```text
frame-ancestors 'self'  https://172.21.100.151 https://.21.100.151 https://00.151
```



**Target header** for this project (UI loads top-level, not in an iframe):



```text
frame-ancestors 'self'
```



Custom IP or hostname entries are **not required** for Help, WebXPanel, or camera previews.



**Fix (on the processor — not in the CH5 build):**



1. Browse to `https://<processor-ip>/setup` → **Security**. Remove any custom **frame ancestors**, **CSP allowed hosts**, or **allowed framing** entries that reference the processor IP.

2. **Crestron Toolbox** → **Web Pages and Mobility Projects**: open the deployed project properties and clear any allowed framing / ancestor hosts that include the processor IP (Toolbox deploy can add these; `ch5-cli deploy` does not).

3. Save, reload `https://<processor-ip>/system/index.html`, and confirm the `Content-Security-Policy` response header no longer lists `https://.21.100.151` or `https://00.151`.

4. From the dev machine, run:



```bash
npm run verify:cp4n -- <processor-ip>
```



   Exit code `0` means no problematic `frame-ancestors` entries were detected.



**Note:** HTTP (`http://<processor-ip>/system/`) does not send this CSP header on 4-Series processors; prefer fixing HTTPS rather than serving the UI over HTTP.



These errors do **not** block WebXPanel when the UI is loaded top-level (not in an iframe).



### `Contract file not found` warning (yellow)



WebXPanel loads `./config/contract.cse2j` relative to the project URL (e.g. `https://172.21.100.151/system/config/contract.cse2j`).



**Fix:** Export the contract from the SIMPL program (Web XPanel IP ID `0x03`), save as `front-end/src/contract/contract.cse2j`, run `npm run build`, and redeploy the `.ch5z` to the processor. The build archives the contract via `ch5-cli archive -c src/contract/contract.cse2j`.



Replace the placeholder contract with the SIMPL export when available so join lists match the program.



---



## Verify



1. Tap Help → manual loads with `returnUrl` in the query string.

2. Back button returns to the control UI.

3. `npm run verify:cp4n -- <processor-ip>` exits 0 and browser console has no red `frame-ancestors` errors.

4. `https://<processor>/system/config/contract.cse2j` returns JSON (not 404).

5. Console shows `Crestron WebXPanel Online`.


