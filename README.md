This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Clinical Core API

This UI calls your Clinical Core backend:

- `GET $NEXT_PUBLIC_API_URL/icd10/search?q=...`

Set the environment variable locally (PowerShell):

```powershell
$env:NEXT_PUBLIC_API_URL = "https://web-production-57d72.up.railway.app"
```

Or create a local env file (not committed because `.env*` is ignored by `.gitignore`):

Create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=https://web-production-57d72.up.railway.app
```

First, run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Clinical search page:

- [http://localhost:3000/search](http://localhost:3000/search)

ICD-10 page:

- [http://localhost:3000](http://localhost:3000)

## ICD-10 Diagnostics

Validate backend connectivity:

```bash
curl -i "https://web-production-57d72.up.railway.app/icd10/search?q=dolor"
```

Validate browser CORS behavior (preflight):

```bash
curl -i -X OPTIONS "https://web-production-57d72.up.railway.app/icd10/search?q=dolor" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: accept"
```

If CORS is not enabled in FastAPI, browser requests can fail even when `curl` returns `200`.

### FastAPI CORS Baseline

```py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://localhost:3000",
        # add your production frontend domains here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Optional request logging in FastAPI:

```py
import logging
from fastapi import Request

logger = logging.getLogger("clinical-api")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("Incoming %s %s", request.method, request.url.path)
    response = await call_next(request)
    logger.info("Completed %s %s -> %s", request.method, request.url.path, response.status_code)
    return response
```

This frontend also includes a same-origin proxy route:

- `GET /api/icd10/search?q=...`

The proxy avoids browser CORS blocks and adds timeout/retry handling for Railway cold starts.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
