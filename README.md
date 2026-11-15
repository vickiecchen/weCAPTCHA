# weCAPTCHA

Fake human-verification brand for a hackathon demo video (~60s).

**Story:** User tries to open the hackathon portal → hard-cut in the video to this site → they must complete escalating CAPTCHA-style challenges → the video never “wins”; it cuts to a team photo.

This repo is the **shell** (white stage + sequencing). Each teammate builds **one challenge** in their own folder and plugs it into the registry. The page is intentionally blank white — **only the active puzzle should be visible** (no shell chrome, titles, or branding).

---

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Saving files hot-reloads the browser.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build
```

---

## Project layout

```
src/
  App.tsx
  main.tsx
  index.css                 # global / shell styles
  components/               # SHELL ONLY — don’t put challenges here
    VerifyShell.tsx         # white stage + challenge sequence
  challenges/
    types.ts                # shared ChallengeProps + ChallengeDefinition
    registry.ts             # ONLY glue file: import + order challenges
    placeholders.tsx        # temporary demos — replace with real challenges
    checkbox/               # example: one folder per challenge (person A)
      index.tsx
      ...
    your-challenge/         # person B
      index.tsx
      ...
```

**Rules**

- **One folder per challenge** under `src/challenges/`.
- **Do not edit** another person’s challenge folder.
- **Shell** (`src/components/`) and **`registry.ts`** are shared — coordinate before changing them.
- Put challenge assets next to that challenge (e.g. `flappy/assets/bird.png`), not in a global dump.
- Don’t put challenge logic inside `VerifyShell`.
- Shell stays **white + no text**. Any instructions, retry copy, or UI live **inside your challenge**.

---

## Challenge contract

Every challenge is a React component that receives:

```ts
type ChallengeProps = {
  onPass: () => void  // advance to the next challenge
  onFail: () => void  // wrong answer → shell shows “try again” (no lockout)
}
```

Defined in `src/challenges/types.ts`.

**Behavior**

- There is **no** fail limit or unavailable/lockout screen.
- Wrong answers call `onFail()` → user stays on the same challenge (show your own retry UI if needed).
- Correct answers call `onPass()` → shell moves to the next challenge in `registry.ts` order.
- The demo is not meant to fully “complete” verification (team photo is an edit cut).

---

## How to add your challenge

### 1. Create your folder

```
src/challenges/<your-challenge-name>/
  index.tsx          # re-export your component (and optional definition)
  YourChallenge.tsx  # the actual UI / game
  styles.css         # optional, challenge-local styles
  assets/            # optional images, sounds, etc.
```

### 2. Implement the component

```tsx
import type { ChallengeProps } from '../types'

export function YourChallenge({ onPass, onFail }: ChallengeProps) {
  return (
    <div>
      {/* your UI */}
      <button type="button" onClick={onPass}>
        Correct
      </button>
      <button type="button" onClick={onFail}>
        Wrong
      </button>
    </div>
  )
}
```

Optional `index.tsx`:

```tsx
export { YourChallenge } from './YourChallenge'
```

### 3. Register it (demo order = array order)

Edit **`src/challenges/registry.ts`** only:

```ts
import type { ChallengeDefinition } from './types'
import { YourChallenge } from './your-challenge'

export const challenges: ChallengeDefinition[] = [
  {
    id: 'your-challenge',
    title: 'Step title',
    prompt: 'Short instruction shown above your challenge',
    Component: YourChallenge,
  },
  // …more challenges in the order they should appear
]
```

Remove or replace entries from `placeholders.tsx` once real challenges are ready.

### 4. Checklist before you push

- [ ] Component only needs `onPass` / `onFail` from the shell  
- [ ] Lives in its own folder under `src/challenges/`  
- [ ] Registered in `registry.ts` in the right order  
- [ ] You didn’t change another teammate’s challenge folder  
- [ ] `npm run build` still succeeds  

---

## Who owns what

| Area | Owner |
|------|--------|
| `src/components/*`, white stage | Shell / whoever owns the landing |
| `src/challenges/registry.ts` | Shared — one person merges order |
| `src/challenges/<name>/` | The teammate building that challenge |
| Demo video cuts (portal → site → team photo) | Edit, not code |

Agree challenge **ids** and **order** early so registry edits are small.

---

## Deploy (Vercel)

1. Push this repo to GitHub.  
2. Import the project on [Vercel](https://vercel.com).  
3. Framework: **Vite** · Build: `npm run build` · Output: `dist`.  

Use the deployed URL in the demo video so you’re not depending on localhost.

---

## Quick reference

| Goal | Where |
|------|--------|
| Run the app | `npm run dev` |
| Shared types | `src/challenges/types.ts` |
| Plug challenges in | `src/challenges/registry.ts` |
| Shell / branding | `src/components/` |
| Temporary demos | `src/challenges/placeholders.tsx` |
