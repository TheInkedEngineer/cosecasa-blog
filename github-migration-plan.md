# Migration Plan: Vercel Blob → GitHub (Simplified, Production-Ready)

## Architecture (Dead Simple)

```
User uploads/edits in admin panel
  ↓
Store in React state + localStorage (resilient to tab close)
  ↓
User clicks "Publish N changes"
  ↓
Server action: Create single atomic commit to main
  ↓
Vercel auto-rebuilds (already configured)
  ↓
Done
```

**No staging branch, no server sessions, no Redis, no merge logic.**

---

## Configuration

### Repository
- **Repo**: `TheInkedEngineer/cosecasa-blog`
- **Branch**: `main` (single branch)
- **Structure**: `/articles/{slug}/text.md` + images

### Environment Variables

**Remove:**
```env
BLOB_READ_WRITE_TOKEN
```

**Add:**
```env
GITHUB_TOKEN=ghp_xxx  # Fine-grained PAT, contents read/write
GITHUB_OWNER=TheInkedEngineer
GITHUB_REPO=cosecasa-blog
GITHUB_BRANCH=main
```

### Security: Fine-Grained PAT

1. GitHub Settings → Developer settings → Personal access tokens → **Fine-grained tokens**
2. Create token:
   - Repository access: **Only `cosecasa-blog`**
   - Permissions: **Contents: Read and write**
   - Expiration: 1 year
3. Store as `GITHUB_TOKEN` in Vercel

---

## Implementation

### Phase 1: GitHub API Wrapper

**Create `lib/github-api.ts`** (~120 lines)

Minimal Octokit wrapper with 5 functions:
- `getCurrentMainSha()` - Get current HEAD
- `createBlob(content, encoding)` - Create file blob
- `createTree(baseTreeSha, entries)` - Create tree
- `createCommit(message, treeSha, parentSha, author)` - Create commit with attribution
- `updateMain(commitSha)` - Fast-forward main (force: false)

**Fast-forward guard:**
```typescript
const parentSha = await getCurrentMainSha()
// ... build tree ...
const commitSha = await createCommit(message, treeSha, parentSha, author)
try {
  await updateMain(commitSha)  // Fails if main moved (force: false)
} catch (error: any) {
  if (error.status === 422) {
    throw new Error('Main branch has changed since you started. Please refresh the admin page and try again.')
  }
  throw error
}
```

**Binary handling:**
```typescript
const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
await createBlob(base64, 'base64')
```

**Commit author attribution:**
```typescript
export async function createCommit(
  message: string,
  treeSha: string,
  parentSha: string,
  author?: { name: string; email: string }
): Promise<string> {
  const commit = await octokit.git.createCommit({
    owner: GITHUB_OWNER!,
    repo: GITHUB_REPO!,
    message,
    tree: treeSha,
    parents: [parentSha],
    author,  // Optional: use Clerk user if provided
  })
  return commit.data.sha
}
```

---

### Phase 2: Client-Side Pending State

**Create `app/admin/pending-changes-context.tsx`** (~120 lines)

React Context + localStorage for resilience:

```typescript
interface PendingUpload {
  slug: string
  title: string
  markdown: string
  images: Array<{ name: string; dataUrl: string; size: number }>  // Track size
}

interface PendingChanges {
  uploads: PendingUpload[]
  deletes: string[]  // slugs to delete
}
```

**Features:**
- Load/save to localStorage automatically
- Survives tab close
- `addUpload()`, `removeUpload()`, `addDelete()`, `removeDelete()`, `clearAll()`
- Validate total localStorage usage

**Image size validation:**
```typescript
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

function validateImageSize(file: File): void {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `Image "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. ` +
      `Maximum allowed: 2MB. Please compress or resize the image.`
    )
  }
}
```

---

### Phase 3: Publish Action

**Create `app/admin/publish-action.ts`** (~120 lines)

Server action for atomic commit:

```typescript
export async function publishChangesAction(
  uploads: PublishUpload[],
  deletes: string[]
): Promise<{ success: boolean; commitSha?: string; error?: string }>
```

**Flow:**
1. Get current user from Clerk (name, email)
2. Get current main SHA
3. Create blobs for all markdown + images
4. Build tree entries (sha: null for deletes)
5. Create tree
6. Create commit with user attribution
7. Update main (fast-forward only, user-friendly error)
8. Revalidate Next.js cache

**User attribution:**
```typescript
import { currentUser } from '@clerk/nextjs/server'

const user = await currentUser()
const author = user ? {
  name: user.fullName || user.username || 'Admin',
  email: user.emailAddresses[0]?.emailAddress || 'admin@cosecasa.it'
} : undefined
```

**Commit message:**
```
Publish articles (+2, -1)
- article-slug-1
- article-slug-2

🤖 via Admin Panel
```

**Error handling:**
```typescript
try {
  await updateMain(commitSha)
} catch (error: any) {
  if (error.message.includes('Main branch has changed')) {
    return {
      success: false,
      error: 'Main branch has changed since you started. Please refresh the admin page and try again.'
    }
  }
  return { success: false, error: error.message }
}
```

---

### Phase 4: Publish Button

**Create `app/admin/publish-button.tsx`** (~80 lines)

Client component:
- Shows pending count badge
- Confirmation dialog with summary
- Calls publish action
- Clears localStorage on success
- Shows commit SHA
- User-friendly error messages

**UI:**
```
[Publish  7]  ← Button with badge

Dialog:
┌─────────────────────────────────┐
│ Publish Changes?                │
│                                 │
│ • 5 new/updated articles        │
│ • 2 deletions                   │
│                                 │
│ This will commit to main and    │
│ trigger a rebuild.              │
│                                 │
│ [Cancel] [Publish]              │
└─────────────────────────────────┘
```

**Error display:**
```typescript
if (result.error) {
  toast.error(result.error, {
    duration: 6000,
    action: result.error.includes('refresh') ? {
      label: 'Refresh',
      onClick: () => window.location.reload()
    } : undefined
  })
}
```

---

### Phase 5: Update Upload Form

**Modify `app/admin/upload/upload-form.tsx`**

Instead of uploading to Vercel Blob:
1. **Validate image size** (2MB max)
2. Read files as data URLs (base64)
3. Call `addUpload()` from context
4. Show toast: "Added to pending. Click Publish to commit."
5. Navigate back to /admin

**Image validation:**
```typescript
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(event.target.files ?? [])

  // Validate sizes
  const oversized = files.filter(f => f.size > MAX_IMAGE_SIZE)
  if (oversized.length > 0) {
    const details = oversized.map(f =>
      `"${f.name}" (${(f.size / 1024 / 1024).toFixed(1)}MB)`
    ).join(', ')

    toast.error(
      `Images too large: ${details}. Maximum: 2MB each. Please compress or resize.`,
      { duration: 8000 }
    )
    return
  }

  // Proceed with valid files...
}
```

**Helper:**
```typescript
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

---

### Phase 6: Update Admin Page

**Modify `app/admin/page.tsx`**

- Wrap with `<PendingChangesProvider>`
- Add `<PublishButton />` near top
- Show pending changes count/summary

---

### Phase 7: Update Markdown Parser

**Modify `lib/markdown-parser.ts`**

Safe URL generation:

```typescript
function ghRawUrl(slug: string, filename: string): string {
  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env

  // Sanitize
  const cleanSlug = slug.replace(/[^a-z0-9-]/g, '')
  const cleanFile = filename.replace(/\\/g, '/').replace(/^\//, '')

  if (cleanFile.includes('..')) {
    throw new Error('Path traversal detected')
  }

  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/articles/${cleanSlug}/${cleanFile}`
}
```

---

### Phase 8: Next.js Config

**Update `next.config.js`**

```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/TheInkedEngineer/cosecasa-blog/**',
      },
    ],
  },
}
```

---

## Security & Validation

### Image Size Limits

**Client-side validation:**
```typescript
const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

if (file.size > MAX_IMAGE_SIZE) {
  throw new Error(
    `Image "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. ` +
    `Maximum: 2MB. Please compress or resize.`
  )
}
```

**Why 2MB:**
- localStorage limit: ~5-10MB total per domain
- Base64 encoding adds ~33% overhead
- 2MB image → ~2.7MB base64 → leaves room for multiple images + markdown

### Slug Validation
```typescript
function validateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug || slug.length > 100 || slug.includes('..')) {
    throw new Error('Invalid slug')
  }

  return slug
}
```

### Path Traversal Prevention
- All slugs: `[a-z0-9-]+` only
- All filenames: reject `..`
- Server-side token only (never exposed to client)

### Error Messages (User-Friendly)

**Fast-forward conflict:**
```
"Main branch has changed since you started. Please refresh the admin page and try again."
```

**Image too large:**
```
Image "photo.jpg" is 5.2MB. Maximum: 2MB. Please compress or resize the image.
```

**Multiple images too large:**
```
Images too large: "img1.jpg" (3.1MB), "img2.png" (4.5MB). Maximum: 2MB each. Please compress or resize.
```

---

## Files Summary

### New Files (~400 lines total)
- `lib/github-api.ts` - Octokit wrapper (~120 lines)
- `app/admin/pending-changes-context.tsx` - React Context (~120 lines)
- `app/admin/publish-button.tsx` - Publish UI (~80 lines)
- `app/admin/publish-action.ts` - Server action (~120 lines)

### Modified Files
- `app/admin/upload/upload-form.tsx` - Image validation + pending context
- `app/admin/page.tsx` - Add PublishButton + provider
- `lib/markdown-parser.ts` - GitHub raw URLs
- `next.config.js` - Allow GitHub images
- `package.json` - Dependencies
- `.env.example` - Update variables

### Deleted Files
- `lib/blob-service.ts` (replaced by `lib/github-api.ts`)

---

## Dependencies

**Remove:**
```json
"@vercel/blob": "^2.0.0"
```

**Add:**
```json
"@octokit/rest": "^20.0.2"
```

---

## What We're NOT Building

❌ Staging branch (`admin-staging`)
❌ Merge/compare logic
❌ Diff viewer
❌ Discard UI (just clear localStorage)
❌ ETag caching (not needed at this scale)
❌ Pagination (Contents API is fine for <100 articles)
❌ Tree API listing (use Contents API)
❌ Preview deployments
❌ Pull requests

---

## Testing Checklist

**Basic Flow:**
- [ ] Upload article → shows in pending state
- [ ] Pending state persists on page refresh (localStorage)
- [ ] Click Publish → atomic commit to main created
- [ ] Commit shows user's name/email as author
- [ ] Vercel rebuilds automatically
- [ ] Article appears on site after build

**Image Validation:**
- [ ] Upload 3MB image → shows friendly error with size + limit
- [ ] Upload multiple oversized images → lists all with sizes
- [ ] Upload valid images → works correctly
- [ ] Total pending size stays under localStorage limit

**Edge Cases:**
- [ ] Slug with spaces/special chars → sanitized to a-z0-9-
- [ ] Path traversal attempt (`../`) → rejected
- [ ] Concurrent edit (main moves) → user-friendly error with refresh option
- [ ] Tab close → pending changes still there on reopen

**Security:**
- [ ] GitHub token never exposed to client
- [ ] All slugs validated
- [ ] All paths sanitized
- [ ] Clerk still protects /admin routes
- [ ] Commit author attribution works

---

## Migration Workflow

1. **Setup:**
   - Create fine-grained GitHub PAT
   - Add environment variables to Vercel
   - Create `articles/empty.txt` on GitHub main branch

2. **Install dependencies:**
   ```bash
   npm install @octokit/rest
   npm uninstall @vercel/blob
   ```

3. **Implement (in order):**
   - Phase 1: github-api.ts (with author support)
   - Phase 2: pending-changes-context.tsx (with size validation)
   - Phase 3: publish-action.ts (with Clerk attribution + friendly errors)
   - Phase 4: publish-button.tsx (with error actions)
   - Phase 5: Update upload form (with image size validation)
   - Phase 6: Update admin page
   - Phase 7: Update markdown-parser.ts
   - Phase 8: Update next.config.js

4. **Test:**
   - Upload test article with images → verify pending state
   - Test oversized image → verify friendly error
   - Publish → verify commit on GitHub with your name
   - Verify Vercel rebuild
   - Verify article shows on site

5. **Cleanup:**
   - Remove `lib/blob-service.ts`
   - Remove Vercel Blob env vars
   - Update `.env.example`

---

## Advantages

✅ **Simple** - ~400 lines of new code total
✅ **Resilient** - localStorage survives tab close
✅ **Fast** - One atomic commit per publish
✅ **Scalable** - Works for 1-100 articles easily
✅ **Production-ready** - Works on Vercel serverless
✅ **No extra infra** - No Redis, no staging branch
✅ **Audit trail** - Full Git history with attribution
✅ **Conflict detection** - Fast-forward guard prevents overwrites
✅ **User-friendly** - Clear error messages with actionable solutions
✅ **Safe** - Image size limits prevent localStorage exhaustion

---

## Scale Considerations

**Current limits:**
- localStorage: ~5-10MB (with 2MB images, ~3 pending articles max)
- Single editor, ~10 commits/day
- <100 articles total

**When you outgrow this (~100 articles):**
- Add pagination for Contents API
- Add ETag caching for repeated reads
- Add tree traversal for bulk operations
- Consider server-side draft storage (Redis/DB)

**For now:** Keep it simple. This handles your scale perfectly.
