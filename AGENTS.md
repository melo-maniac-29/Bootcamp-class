# Coding Standards & Best Practices — AI Agent Rules

A machine-readable ruleset for AI coding agents working in this project.
Combines company-wide coding standards with FastAPI/Python production best practices.

> **For human developers**: See `guidelines.md` for the full detailed guide with examples.
> This file is optimized for fast pattern-matching by AI agents.

---

## Compatibility Matrix

Pin to these versions or newer. All code examples assume them.

| Dependency        | Minimum   | Notes                                                     |
|-------------------|-----------|-----------------------------------------------------------|
| Python            | 3.11      | Required for `StrEnum` and `X \| Y` union syntax          |
| FastAPI           | 0.115     | `Annotated[T, Depends(...)]` is the idiomatic form        |
| Pydantic          | 2.7       | v1 APIs (`json_encoders`, `.dict()`) are removed          |
| pydantic-settings | 2.4       | Separate package since Pydantic v2                        |
| SQLAlchemy        | 2.0       | Use async API (`AsyncSession`, `async_sessionmaker`)      |
| Alembic           | 1.13      | Async-aware migrations                                    |
| httpx             | 0.27      | Use `ASGITransport` for in-process tests                  |
| PyJWT             | 2.9       | Use this, NOT the unmaintained `python-jose`              |
| ruff              | 0.6       | Replaces black, isort, autoflake                          |

---

## 1. Naming Conventions (Mandatory)

All names must follow consistent patterns across the entire codebase.

| Element     | Convention             | Examples                                           |
|-------------|------------------------|----------------------------------------------------|
| Functions   | `verbResource`         | `createUser`, `getInvoice`, `updateOrderStatus`    |
| Booleans    | `is/has/can` prefix    | `isActive`, `hasExpired`, `canRetry`               |
| Variables   | Descriptive, no abbrev | `userEmail`, `retryCount` — NOT `ue`, `rc`         |
| Files (JS)  | `kebab-case`           | `user-service.js`, `payment-controller.js`         |
| Files (PY)  | `snake_case`           | `user_service.py`, `payment_controller.py`         |
| Constants   | `UPPER_SNAKE_CASE`     | `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE`          |
| DB tables   | `lower_snake_case`, singular | `user`, `post`, `post_like`, `payment_bill`  |
| DB datetime | `_at` suffix           | `created_at`, `updated_at`, `deleted_at`           |
| DB date     | `_date` suffix         | `birth_date`, `expiry_date`                        |

```python
# DON'T — unclear, abbreviated
def fn(u): ...
def chk(x): ...
rc = 0

# DO — clear, descriptive
async def create_user_record(user_payload: dict): ...
def is_email_verified(user: User) -> bool: ...
retry_count = 0
```

---

## 2. Project Structure

Standardize the codebase structures across projects. Give top priority to the company's official standard structure, followed by modular domain patterns for large-scale systems.

### Python (FastAPI)

#### 1. Official Standard (Priority): Layer-Based Layout
Use the standard layer-based project layout as the default for company applications:

```
app/
├── api/
│   ├── routes/         # API endpoint definitions namespaced by resource
│   └── controllers/    # Input parsing, call service, format response
├── services/           # Business logic layer (no HTTP objects, no direct DB)
├── models/             # SQLAlchemy ORM model definitions
├── schemas/            # Pydantic models for request/response validation
├── repositories/       # Concurrency/database query operations only
├── db/                 # Database engine session management and migrations
├── core/               # Environment config, settings, and logging startup
├── utils/              # Pure utility functions (no business logic)
└── tests/              # pytest unit and integration test suites
```

#### 2. Advanced Scaling (Recommendation): Domain-Driven Bounded Context
For highly complex, larger applications where components are isolated by business domains:

```
src/
├── {domain}/           # e.g., auth/, posts/, payments/
│   ├── router.py       # API endpoints — thin, no business logic
│   ├── schemas.py      # Pydantic models (request/response validation)
│   ├── models.py       # SQLAlchemy ORM models
│   ├── service.py      # Business logic (no HTTP, no direct DB)
│   ├── dependencies.py # Route dependencies (validation, auth)
│   ├── repository.py   # DB queries (thin layer between service and DB)
│   ├── config.py       # Domain-scoped BaseSettings
│   ├── constants.py    # Constants and error codes
│   ├── exceptions.py   # Domain-specific exceptions
│   └── utils.py        # Non-business helper functions
├── config.py           # Global BaseSettings
├── models.py           # Shared ORM base models
├── exceptions.py       # Global exceptions
├── database.py         # Async engine + session factory
└── main.py             # FastAPI app + lifespan
tests/
├── auth/
├── posts/
└── conftest.py
alembic/
requirements/
├── base.txt
├── dev.txt
└── prod.txt
.env
alembic.ini
```

### Node.js (Express)
```
src/
├── routes/             # URL → controller mapping only
├── controllers/        # Request parsing, call service, return response
├── services/           # Business logic — no HTTP, no direct DB
├── repositories/       # All DB queries
├── models/             # Prisma/Sequelize schemas
├── db/                 # Connection, migrations, seeders
├── middlewares/        # Auth, validation, logging, rate-limiting
├── utils/              # Pure utility functions — no business logic
├── config/             # Environment-specific variables
└── tests/
```

### React (Frontend)
```
src/
├── components/         # Reusable UI blocks (buttons, cards, modals)
├── pages/              # One per route in React Router
├── hooks/              # Reusable custom hooks
├── services/           # All API calls
├── context/            # React Context Providers
├── utils/              # Pure helper functions
├── assets/             # Images, icons, SVGs
├── styles/             # CSS modules, global styles
└── tests/
```

### Cross-domain imports — always explicit module name
```python
# DO
from src.auth import constants as auth_constants
from src.notifications import service as notification_service
from src.posts.constants import ErrorCode as PostsErrorCode

# DON'T — deep path coupling
from src.auth.service.user import create_user_handler
# DON'T — wildcard imports
from src.auth import *
```

---

## 3. Architecture — Separation of Concerns

### The mandatory layer pattern
```
Route/Controller → Service → Repository → Database
     ↑                ↑            ↑
  HTTP only      Business logic  DB queries only
  (thin)         (no HTTP,       (no business logic)
                  no DB)
```

### Rules
- **Routes/Controllers**: Input parsing, validation, call service, return response. NO business logic.
- **Services**: Business logic. NO HTTP objects (`req`, `res`). NO direct DB queries.
- **Repositories**: DB queries only. NO business logic. Thin layer.
- **Models**: Schema definitions only.
- **Utils**: Pure functions. NO business logic. NO DB access.

```python
# DON'T — business logic in route
@router.post("/users")
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar():
        raise HTTPException(400, "Email exists")
    user = User(**data.dict())
    db.add(user)
    await db.commit()
    await send_email(user.email)
    return user

# DO — thin route, clean service
@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(data: UserCreate):
    return await user_service.create_user(data)
```

---

## 4. Async Routes — Critical Rules

### Decision table

| Route does this                       | Use                                               |
|---------------------------------------|----------------------------------------------------|
| `await`-able non-blocking I/O         | `async def`                                        |
| Blocking I/O (no async client exists) | `def` (sync — FastAPI runs it in threadpool)       |
| Mix of both                           | `async def` + `run_in_threadpool` for blocking part|
| CPU-bound work (>50 ms compute)       | Offload to Celery / Arq / RQ worker process        |

### Do / Don't

```python
# DON'T — blocking call inside async route FREEZES the entire event loop
@router.get("/bad")
async def bad():
    time.sleep(10)            # blocks EVERY request on this worker
    return {"ok": True}

# DO — sync route lets FastAPI run it in a threadpool
@router.get("/sync-ok")
def sync_ok():
    time.sleep(10)            # blocks one threadpool worker, not the loop
    return {"ok": True}

# DO — async route with awaitable I/O
@router.get("/async-ok")
async def async_ok():
    await asyncio.sleep(10)   # yields control, loop keeps serving
    return {"ok": True}

# DO — wrap sync library in async route
from fastapi.concurrency import run_in_threadpool

@router.get("/wrap")
async def wrap():
    result = await run_in_threadpool(legacy_sync_client.fetch, "id")
    return result
```

### Concurrency Rules (CPU vs I/O)
- **CPU-Bound**: Threads DON'T help due to the Python GIL. Use `multiprocessing` or external task queues (Celery, Arq, RQ).
- **I/O-Bound (e.g., Database queues)**: Python `threading` (with `queue.Queue`) or `asyncio` works perfectly.
- Default Starlette threadpool = 40 threads. Saturating it with blocking I/O slows the whole app.

---

## 5. API Design (Mandatory)

### REST conventions
```
# DO — nouns for resources, HTTP methods for actions
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

# DON'T — verbs in URLs
/api/v1/getUsers
/api/v1/createUser
/api/v1/deleteUserById
```

### Versioning rules
- ALL production API routes MUST have version prefix: `/api/v1/`
- Use integer versioning (`v1`, `v2`) — NOT semantic (`v1.1`, `v1.2.3`)
- New version ONLY for breaking changes (changed response structure, removed fields, added required fields)
- Non-breaking changes (optional fields, new endpoints, performance) stay in same version

### Standard response envelope — ALL APIs must use this

```python
# Success
{"status": "success", "data": { ... }}

# Error
{"status": "error", "error": {"code": "USER_NOT_FOUND", "message": "No user exists with the provided ID."}}
```

### Endpoint documentation
```python
@router.post(
    "/items",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an item",
    description="Creates an item owned by the authenticated user.",
    tags=["items"],
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse, "description": "Validation error"},
        status.HTTP_409_CONFLICT:    {"model": ErrorResponse, "description": "Slug already exists"},
    },
)
async def create_item(payload: ItemCreate) -> ItemResponse: ...
```

---

## 6. Error Handling (Mandatory)

### Structured error objects
```python
# Error codes: CONSTANT_CASE, descriptive
# DO:  USER_NOT_FOUND, INVALID_PAYLOAD, UNAUTHORIZED, EMAIL_ALREADY_EXISTS
# DON'T: err-101-x, somethingWrong, ExceptionOccurred, dbIssue
```

### Custom exception class
```python
class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 500, details: dict = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}

@app.exception_handler(AppError)
async def handle_app_error(request: Request, exc: AppError):
    logger.error({
        "timestamp": datetime.utcnow().isoformat(),
        "request_id": request.state.request_id,
        "path": str(request.url),
        "error_code": exc.code,
        "message": exc.message,
        "details": exc.details,
    })
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "error": {"code": exc.code, "message": exc.message}},
    )
```

### Rules
- NEVER expose stack traces to clients — log them server-side only
- Stack traces go to: logs, Sentry, Datadog — NOT to API responses
- ALL logs must include: `request_id`, `timestamp`, `path`, `error_code`
- NEVER catch bare `Exception` — catch specific exception classes

---

## 7. Pydantic (Mandatory for FastAPI)

### Use built-in validators extensively
```python
from enum import StrEnum
from pydantic import AnyUrl, BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=128)
    username: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")
    email: EmailStr
    age: int = Field(ge=18)
    favorite_band: MusicBand | None = None
    website: AnyUrl | None = None

# DON'T — constraint contradicts default
age: int = Field(ge=18, default=None)  # WRONG

# DO — pick required or optional
age: int = Field(ge=18)                         # required
age: int | None = Field(default=None, ge=18)    # optional
```

### Custom base model with standardized datetime
```python
from datetime import datetime
from zoneinfo import ZoneInfo
from pydantic import BaseModel, ConfigDict, field_serializer

class CustomModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    @field_serializer("*", when_used="json", check_fields=False)
    def _serialize_datetimes(self, value):
        if isinstance(value, datetime):
            if value.tzinfo is None:
                value = value.replace(tzinfo=ZoneInfo("UTC"))
            return value.strftime("%Y-%m-%dT%H:%M:%S%z")
        return value
```

### Split BaseSettings by domain
```python
# DO — one config per domain
# src/auth/config.py
class AuthConfig(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AUTH_", env_file=".env", extra="ignore")
    JWT_ALG: str
    JWT_SECRET: str
    JWT_EXP_MINUTES: int = 5

auth_settings = AuthConfig()

# DON'T — one giant config for everything
class MegaConfig(BaseSettings):
    JWT_SECRET: str
    DB_URL: str
    REDIS_URL: str
    SMTP_HOST: str
    # ... 50 more vars
```

---

## 8. Dependencies (FastAPI)

### Use Annotated form (modern, idiomatic)
```python
# DO — Annotated form
from typing import Annotated
from fastapi import Depends

PostDep = Annotated[dict, Depends(valid_post_id)]

@router.get("/posts/{post_id}")
async def get_post(post: PostDep):
    return post

# DON'T — legacy default-argument form
@router.get("/posts/{post_id}")
async def get_post(post: dict = Depends(valid_post_id)):
    return post
```

### Validate inside dependencies
```python
async def valid_post_id(post_id: UUID4) -> dict:
    post = await service.get_by_id(post_id)
    if not post:
        raise PostNotFound()
    return post
```

### Chain dependencies for reuse
```python
async def valid_owned_post(
    post: Annotated[dict, Depends(valid_post_id)],
    token_data: Annotated[dict, Depends(parse_jwt_data)],
) -> dict:
    if post["creator_id"] != token_data["user_id"]:
        raise UserNotOwner()
    return post
```

### Rules
- Dependencies are **cached per request** — same `Depends(x)` called 5 times → runs once
- Prefer `async def` dependencies — sync deps waste threadpool for small CPU checks
- Use **same path variable name** across endpoints sharing a dependency

---

## 9. Database (Mandatory)

### Async SQLAlchemy 2.0
```python
# src/database.py
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

engine = create_async_engine(str(settings.DATABASE_URL), pool_pre_ping=True)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with SessionFactory() as session:
        yield session
```

### Index naming convention
```python
POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "%(column_0_label)s_idx",
    "uq": "%(table_name)s_%(column_0_name)s_key",
    "ck": "%(table_name)s_%(constraint_name)s_check",
    "fk": "%(table_name)s_%(column_0_name)s_fkey",
    "pk": "%(table_name)s_pkey",
}
metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)
```

### Rules
- ONE centralized DB connection module per project — no connections in routes/services
- ALL credentials via environment variables — NEVER hardcoded
- NO raw SQL in controllers/routes — use repository layer
- Use ORM or query builders (SQLAlchemy, Prisma)
- Validate data BEFORE writing to DB — don't rely on DB constraint errors
- Use transactions for multi-step operations
- Index frequently queried columns and foreign keys
- Avoid `SELECT *` in production
- SQL-first, Pydantic-second — let Postgres handle joins/aggregation
- **Concurrency & Queues**: Use `FOR UPDATE SKIP LOCKED` for concurrent workers processing database queues to prevent deadlocks and double-processing.
- **Resilience**: Wrap transient database errors (e.g., operational errors, deadlocks) in an exponential `retry_with_backoff` decorator.

### Migrations (Alembic)
- Must be static and reversible
- Use async template: `alembic init -t async migrations`
- Descriptive filenames: `2026-05-27_add_user_last_login.py`
```ini
# alembic.ini
file_template = %%(year)d-%%(month).2d-%%(day).2d_%%(slug)s
```
- Every migration must document: filename, description, rollback steps, related feature

---

## 10. Background Tasks

| Use BackgroundTasks when…               | Use Celery / Arq / RQ when…                     |
|------------------------------------------|--------------------------------------------------|
| Task is < 1 second                       | Task takes seconds to minutes                    |
| Failure can be silently dropped          | You need retries, dead-letter, or visibility     |
| Task is in-process (send email, log row) | Task is CPU-heavy or needs a separate pool       |
| You don't need scheduling                | You need cron, ETA, or rate limiting             |

```python
# Fire-and-forget — OK for short, non-critical tasks
@router.post("/signup")
async def signup(data: SignupIn, bg: BackgroundTasks):
    user = await service.create_user(data)
    bg.add_task(send_welcome_email, user.email)
    return user
```

> BackgroundTasks run after the response, in the same worker. If the worker dies, the task is lost.
> No retry. If you'd page someone when the task is lost, use Celery.

---

## 11. Testing

### Async client from day 1
```python
import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_post(client: AsyncClient):
    resp = await client.post("/posts", json={"title": "hi"})
    assert resp.status_code == 201
```

### Override dependencies — don't monkeypatch
```python
from src.auth.dependencies import parse_jwt_data
from src.main import app

def fake_user():
    return {"user_id": "00000000-0000-0000-0000-000000000001"}

@pytest.fixture(autouse=True)
def _override_auth():
    app.dependency_overrides[parse_jwt_data] = fake_user
    yield
    app.dependency_overrides.clear()
```

### DON'T use
- `async_asgi_testclient` — unmaintained
- Mocking the database in integration tests — use a real DB (testcontainers)

---

## 12. Function Documentation (Mandatory)

Every function must have documentation directly above it.

### Python (Google-style docstring)
```python
def create_user(payload: UserCreate) -> UserResponse:
    """
    Purpose:
        Create a new user, validate uniqueness, hash password, save to DB.

    Args:
        payload (UserCreate): User registration data with name, email, password.

    Returns:
        UserResponse: Created user with id, name, email.

    Raises:
        DuplicateUserError: Email already registered.
        ValueError: Missing or invalid fields.

    Side Effects:
        - Writes to "users" table
        - Queues verification email task

    Flowchart: create_user_flowchart.png
    """
    ...
```

### JavaScript (JSDoc)
```js
/**
 * Purpose: Create a new user record and send a verification email.
 *
 * @param {Object} payload - { name: string, email: string, password: string }
 * @returns {Promise<Object>} - { id: string, name: string, email: string }
 *
 * Errors:
 *   - USER_ALREADY_EXISTS
 *   - INVALID_EMAIL_FORMAT
 *
 * Side Effects:
 *   - Inserts user into database
 *   - Sends verification email
 *
 * Flowchart: create_user_flowchart.png
 */
async function createUser(payload) { ... }
```

### Rules
- Documentation MUST be directly above the function
- Every exported/public function MUST be documented
- Comments inside function body = explain WHY, not WHAT
- Functions should not exceed 50–70 lines
- Every function should have single responsibility

---

## 13. Git Workflow (Mandatory)

### Branching
```
main                    # Always deployable. Only merges via approved PRs.
develop (optional)      # For complex weekly integration.
feature/<name>          # All tasks: feature/login-sso, feature/add-user-search
hotfix/<name>           # Urgent fixes: hotfix/fix-payment-signature
```

### Commit messages — Conventional Commits
```
<type>(<scope>): <short message>

# Types: feat, fix, docs, style, refactor, test, chore

# DO
feat(auth): add OTP-based login
fix(api): handle null response in invoice list
docs(readme): update setup instructions
refactor(user-service): simplify validation logic

# DON'T
Update file
Fix bug
Working code
temp changes
```

### Pull Requests
- Title format: `feat: enable team filters in dashboard`
- Must include: Summary, Related Issue, Changes, How to Test, Checklist
- Merge method: **Squash & Merge** only — one commit per PR
- Minimum 1 reviewer approval (2 for auth/payments/DB migrations)
- NO direct commits to `main`
- ALL CI checks must pass before merge

### PR Checklist
```markdown
- [ ] Code follows style guidelines
- [ ] Function documentation present
- [ ] Added unit tests
- [ ] Updated documentation
- [ ] No secrets committed
- [ ] No console.log/debug code
- [ ] No commented-out legacy code
- [ ] Error handling follows standard envelope
- [ ] CI checks passed
```

---

## 14. API Versioning & Deprecation

### Rules
- ALL production routes: `/api/v1/`, `/api/v2/`
- New version ONLY for breaking changes
- Deprecation notice: minimum **90 days** before removal
- Deprecated endpoints MUST return warning headers:
```
Deprecation: true
Deprecation-Version: v1
Deprecation-Removal-Date: 2025-06-30
Deprecated-By: /api/v2/users
```

### Deprecation workflow
1. **Mark** — Label code, add log warnings, add response headers
2. **Notify** — Week 1: release notes → Week 2: internal teams → Week 3: external clients
3. **Monitor** — Track usage of deprecated endpoints
4. **Freeze** — No new features on deprecated version
5. **Remove** — After 90 days, archive code, update docs, announce in release notes

---

## 15. Linting & Formatting

```shell
ruff check --fix src
ruff format src
```

Run in pre-commit hook or CI. Ruff replaces black + isort + autoflake + most of flake8.

---

## 16. API Docs — Hide in Production

```python
from fastapi import FastAPI
from src.config import settings

SHOW_DOCS_IN = {"local", "staging"}
app_kwargs = {"title": "My API"}
if settings.ENVIRONMENT not in SHOW_DOCS_IN:
    app_kwargs["openapi_url"] = None  # disables /docs and /redoc

app = FastAPI(**app_kwargs)
```

---

## Anti-Patterns Checklist

If reviewing code, check for these. Each is a real failure mode.

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| `time.sleep()` / `open()` / sync DB inside `async def` | Blocks the entire event loop | Use async equivalent or `run_in_threadpool()` |
| `requests.get()` inside `async def` | `requests` is sync — blocks loop | Use `httpx.AsyncClient` |
| `from jose import jwt` | `python-jose` is unmaintained | `import jwt` (PyJWT) |
| `from async_asgi_testclient import TestClient` | Unmaintained | `httpx.AsyncClient` + `ASGITransport` |
| `model_config = ConfigDict(json_encoders={...})` | Deprecated in Pydantic v2 | `@field_serializer` or `PlainSerializer` |
| `Field(ge=18, default=None)` | Constraint contradicts default | Pick required or optional, not both |
| `def dep(...): return x` (non-async dependency) | Wastes threadpool for CPU-only check | Use `async def` |
| `post: dict = Depends(valid_post_id)` | Legacy default-arg form | `post: Annotated[dict, Depends(valid_post_id)]` |
| Catching bare `Exception` in routes | Hides bugs, turns 500s into silent 200s | Catch specific exception classes |
| `BackgroundTasks` for critical work | No retry, dies with worker | Use Celery / Arq / RQ |
| Sync ORM session inside `async def` | Blocks loop, may deadlock pool | Use `AsyncSession` |
| Returning Pydantic model + same `response_model` | Model constructed twice | Return dict/ORM row, or drop `response_model` |
| `from src.auth.service.user import ...` (deep paths) | Tight coupling | `from src.auth import service as auth_service` |
| One `BaseSettings` for whole app | Hard to reason about | One `BaseSettings` per domain |
| Mocking DB in integration tests | Mock/prod divergence | Use real DB + `dependency_overrides` |
| Raw SQL in controllers/routes | Violates separation of concerns | Use repository layer |
| Hardcoded DB credentials | Security risk | Use environment variables |
| Stack traces in API responses | Exposes internals to attackers | Log server-side only |
| `SELECT *` in production queries | Performance — full table scan | Select specific columns, use indexes |
| No `request_id` in error logs | Cannot trace failing requests | Add request_id middleware |
| Verb-based API URLs (`/getUsers`) | Not RESTful | Use nouns: `GET /users` |
| Business logic in controllers | Violates separation of concerns | Move to service layer |

---

## Quick Reference

| Scenario                                | Solution                                           |
|-----------------------------------------|----------------------------------------------------|
| Non-blocking I/O                        | `async def` route with `await`                     |
| Blocking I/O (no async client)          | `def` route (sync, runs in threadpool)             |
| Sync library inside async route         | `await run_in_threadpool(fn, *args)`               |
| CPU-intensive work                      | Celery / Arq / RQ worker process                   |
| Request validation against DB           | Dependency that loads + validates + returns        |
| Reuse validation across routes          | Chain dependencies                                 |
| Inject dependency (modern style)        | `Annotated[T, Depends(...)]`                       |
| Per-request dep caching                 | Default behavior — same `Depends(x)` runs once     |
| Per-domain config                       | One `BaseSettings` subclass per domain             |
| Custom datetime serialization           | `@field_serializer`                                |
| Fire-and-forget short task              | `BackgroundTasks`                                  |
| Reliable / scheduled / heavy task       | Celery / Arq / RQ                                  |
| JWT decode                              | `PyJWT` (`import jwt`)                             |
| Async DB                                | SQLAlchemy 2.0 async (`AsyncSession`)              |
| HTTP test client                        | `httpx.AsyncClient` + `ASGITransport`              |
| Swap dep in tests                       | `app.dependency_overrides[dep] = fake`             |
| Lint + format                           | `ruff check --fix` + `ruff format`                 |
| API response format                     | `{"status": "success/error", "data/error": {...}}` |
| Error codes                             | `CONSTANT_CASE`: `USER_NOT_FOUND`                  |
| Commit messages                         | `feat(scope): description`                         |
| Branch naming                           | `feature/<name>`, `hotfix/<name>`                  |
| API versioning                          | `/api/v1/resource`                                 |
| Deprecation period                      | Minimum 90 days with warning headers               |
