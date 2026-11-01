import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'devspace-jwt-production-secret-2026';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devspace';
let isMongoConnected = false;

// Configure CORS for both local development (ports 5173, 5000) and production
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure data directory exists for persistence
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // bcrypt hash
  bio: string;
  avatar: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: 'draft' | 'published';
  readingTime: number; // in minutes
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
  };
  likes?: string[];
  comments?: Comment[];
  bookmarks?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Database {
  users: User[];
  posts: Post[];
}

// Helpers
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// In-memory + persisted DB
let db: Database = {
  users: [],
  posts: [],
};

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

function loadOrSeedDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      if (db.users && db.posts && db.users.length > 0) {
        return;
      }
    } catch (e) {
      console.warn('Error reading db.json, re-seeding...', e);
    }
  }

  // Seed default data
  const salt = bcrypt.genSaltSync(10);
  const demoHashedPassword = bcrypt.hashSync('password123', salt);

  const demoUser: User = {
    id: 'user-demo-1',
    name: 'Alex Rivera',
    email: 'developer@devspace.io',
    password: demoHashedPassword,
    bio: 'Staff Software Architect & open-source contributor. Obsessed with high-scale distributed systems and developer tooling.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    createdAt: new Date('2026-01-15T10:00:00.000Z').toISOString(),
  };

  const authorElena: User = {
    id: 'user-elena-2',
    name: 'Elena Rostova',
    email: 'elena@devspace.io',
    password: demoHashedPassword,
    bio: 'Frontend Engineer & React core enthusiast. Writing about modern web architecture, state mechanics, and TypeScript.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    createdAt: new Date('2026-02-10T14:30:00.000Z').toISOString(),
  };

  const authorMarcus: User = {
    id: 'user-marcus-3',
    name: 'Marcus Vance',
    email: 'marcus@devspace.io',
    password: demoHashedPassword,
    bio: 'Cloud Infrastructure & Database Specialist. Exploring database engines, zero-downtime migrations, and latency tuning.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    createdAt: new Date('2026-03-01T09:00:00.000Z').toISOString(),
  };

  db.users = [demoUser, authorElena, authorMarcus];

  db.posts = [
    {
      id: 'post-1',
      title: 'Architecting Resilient Distributed Systems with Node.js and Event-Driven Streams',
      slug: 'architecting-resilient-distributed-systems-with-nodejs',
      coverImage: '/src/assets/images/bg_landing_tech_1793504993992.jpg',
      tags: ['Node.js', 'Architecture', 'System Design', 'Backend'],
      status: 'published',
      readingTime: 6,
      authorId: demoUser.id,
      author: {
        id: demoUser.id,
        name: demoUser.name,
        avatar: demoUser.avatar,
        bio: demoUser.bio,
      },
      content: `Distributed architectures demand proactive tolerance for partial failures, backpressure, and asynchronous message delivery. In high-throughput Node.js microservices, conventional synchronous HTTP chaining creates brittle bottlenecks and cascade outages.

### The Problem with Tight Coupling

When Service A calls Service B over REST, latency compounds exponentially:

$$\\text{Total Latency} = \\sum_{i=1}^n L_i + \\text{Network Overhead}$$

If any intermediate service degrades or experiences garbage-collection stalls, upstream caller connection pools exhaust rapidly.

### Designing Stream-Based Event Pipelines

Using decoupled log-based message brokers alongside Node.js native streams allows ingestion decoupled from downstream processing:

\`\`\`typescript
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

export async function processTelemetryBatch(inputStream: NodeJS.ReadableStream) {
  const parseJsonTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        const payload = JSON.parse(chunk.toString());
        callback(null, payload);
      } catch (err) {
        callback(err as Error);
      }
    }
  });

  await pipeline(inputStream, parseJsonTransform, async function* (source) {
    for await (const chunk of source) {
      yield await persistToDatabase(chunk);
    }
  });
}
\`\`\`

### Circuit Breakers and Graceful Degradation

Always wrap external dependencies in deterministic circuit breakers with exponential backoff and localized cache fallbacks.

- **Fast failure:** Do not hold worker threads waiting 30 seconds for dead endpoints.
- **Backpressure signaling:** Monitor high watermark buffers and reject non-critical workloads early.
- **Idempotency keys:** Every mutation event must carry a unique transaction hash to prevent duplicate writes during network retries.`,
      createdAt: new Date('2026-10-24T12:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-24T12:00:00.000Z').toISOString(),
    },
    {
      id: 'post-2',
      title: 'Mastering React 19: Server Actions, Optimistic State, and Compiler Internals',
      slug: 'mastering-react-19-server-actions-and-optimistic-ui',
      coverImage: '/src/assets/images/bg_auth_mesh_1793505007422.jpg',
      tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
      status: 'published',
      readingTime: 5,
      authorId: authorElena.id,
      author: {
        id: authorElena.id,
        name: authorElena.name,
        avatar: authorElena.avatar,
        bio: authorElena.bio,
      },
      content: `React 19 reshapes how modern frontend engineers reason about data mutations, form lifecycles, and component memoization. Gone are the days of manual \`useMemo\` and \`useCallback\` micro-optimizations.

### The Power of \`useActionState\`

Modern form submissions no longer require complex \`useState\` tracking for loading flags and validation errors:

\`\`\`tsx
import { useActionState, useOptimistic } from 'react';

async function updateProfileName(previousState: string, formData: FormData) {
  const newName = formData.get('name') as string;
  const res = await api.put('/users/me', { name: newName });
  return res.data.name;
}

export function ProfileEditor({ initialName }: { initialName: string }) {
  const [name, formAction, isPending] = useActionState(updateProfileName, initialName);
  const [optimisticName, setOptimisticName] = useOptimistic(
    name,
    (current, update: string) => update
  );

  return (
    <form action={async (formData) => {
      const val = formData.get('name') as string;
      setOptimisticName(val);
      await formAction(formData);
    }}>
      <input name="name" defaultValue={optimisticName} disabled={isPending} />
      <button type="submit">{isPending ? 'Updating...' : 'Save'}</button>
    </form>
  );
}
\`\`\`

### Key Architecture Takeaways

1. **Optimistic Updates**: Render immediate UI confirmations while the network round-trip resolves.
2. **Built-in Error Boundaries**: Native action error propagation means clean handling without boilerplate \`try/catch\` blocks in components.
3. **Form Restoration**: Native cancellation and state reconciliation maintain focus and draft content smoothly.`,
      createdAt: new Date('2026-10-26T08:15:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-26T08:15:00.000Z').toISOString(),
    },
    {
      id: 'post-3',
      title: 'Production MongoDB Aggregations: Index Utilization and Zero-Allocation Pipelines',
      slug: 'production-mongodb-aggregations-and-index-utilization',
      coverImage: '/src/assets/images/bg_workspace_dark_1793505024814.jpg',
      tags: ['MongoDB', 'Database', 'Backend', 'Performance'],
      status: 'published',
      readingTime: 7,
      authorId: authorMarcus.id,
      author: {
        id: authorMarcus.id,
        name: authorMarcus.name,
        avatar: authorMarcus.avatar,
        bio: authorMarcus.bio,
      },
      content: `MongoDB aggregation pipelines provide exceptional flexibility, but in production with millions of documents, unindexed pipeline stages trigger catastrophic full-collection scans and RAM thrashing.

### The Cardinal Rule of \`$match\` Placement

Always position your \`$match\` stage at the very beginning of the pipeline. Doing so allows the query engine to utilize compound B-Tree indexes:

\`\`\`javascript
db.articles.aggregate([
  // Stage 1: Strictly indexed match
  {
    $match: {
      status: 'published',
      publishedAt: { $gte: ISODate('2026-01-01T00:00:00Z') }
    }
  },
  // Stage 2: Selective projection before costly groupings
  {
    $project: {
      tags: 1,
      authorId: 1,
      readingTime: 1
    }
  },
  // Stage 3: Unwind and aggregate
  { $unwind: '$tags' },
  {
    $group: {
      _id: '$tags',
      articleCount: { $sum: 1 },
      avgReadingTime: { $avg: '$readingTime' }
    }
  },
  { $sort: { articleCount: -1 } }
]);
\`\`\`

### Index Prefix Principles

When creating compound indexes:
\`\`\`javascript
db.articles.createIndex({ status: 1, tags: 1, createdAt: -1 });
\`\`\`
Ensure queries follow the Equality, Sort, Range (ESR) rule to maximize covered query execution!`,
      createdAt: new Date('2026-10-28T16:45:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-28T16:45:00.000Z').toISOString(),
    },
    {
      id: 'post-4',
      title: 'Modern CSS in 2026: Container Queries, Subgrid, and Cascade Layer Architecture',
      slug: 'modern-css-container-queries-subgrid-and-cascade-layers',
      coverImage: '/src/assets/images/bg_nodes_mesh_1793505041099.jpg',
      tags: ['CSS', 'Frontend', 'Web Development'],
      status: 'published',
      readingTime: 4,
      authorId: authorElena.id,
      author: {
        id: authorElena.id,
        name: authorElena.name,
        avatar: authorElena.avatar,
        bio: authorElena.bio,
      },
      content: `CSS has matured dramatically. Modern web layouts no longer rely on brittle viewport media queries or JavaScript-based resize listeners.

### The Shift from Viewport to Container Queries

With \`@container\`, components adapt directly to their parent container's width, enabling true component portability across sidebars, modal dialogues, and multi-column feeds:

\`\`\`css
.card-wrapper {
  container-type: inline-size;
  container-name: article-card;
}

@container article-card (min-width: 480px) {
  .card-content {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 1.5rem;
  }
}
\`\`\`

### Subgrid for Aligned Editorial Cards

Subgrid ensures cards within an auto-fit grid align headers, content excerpts, and footers across adjacent columns even with uneven text lengths!`,
      createdAt: new Date('2026-10-29T11:20:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-29T11:20:00.000Z').toISOString(),
    },
    {
      id: 'post-5',
      title: 'Python Asyncio & Concurrency: High-Performance Microservices Without Leaks',
      slug: 'python-asyncio-concurrency-microservices',
      coverImage: '/src/assets/images/bg_workspace_dark_1793505024814.jpg',
      tags: ['Python', 'Microservices', 'Backend', 'System Design'],
      status: 'published',
      readingTime: 6,
      authorId: authorMarcus.id,
      author: {
        id: authorMarcus.id,
        name: authorMarcus.name,
        avatar: authorMarcus.avatar,
        bio: authorMarcus.bio,
      },
      content: `Python's asyncio loop is remarkably capable when built with strict coroutine management and bounded task queues. However, fire-and-forget background tasks frequently leak memory or swallow unhandled exceptions.

### Structured Concurrency with TaskGroup

Python 3.11+ introduced \`asyncio.TaskGroup\`, which guarantees that all spawned tasks either complete together or terminate safely when an error occurs:

\`\`\`python
import asyncio
from typing import List, Dict

async def fetch_upstream_metrics(sensor_id: str) -> Dict[str, float]:
    await asyncio.sleep(0.05)
    return {"sensor_id": sensor_id, "reading": 42.8}

async def aggregate_cluster() -> List[Dict[str, float]]:
    results = []
    async with asyncio.TaskGroup() as tg:
        tasks = [
            tg.create_task(fetch_upstream_metrics(f"node_{i}"))
            for i in range(10)
        ]
    return [t.result() for t in tasks]
\`\`\`

Always prefer \`TaskGroup\` over legacy \`asyncio.gather\` to ensure complete fault tolerance and clear stack traces.`,
      createdAt: new Date('2026-10-30T09:10:00.000Z').toISOString(),
      updatedAt: new Date('2026-10-30T09:10:00.000Z').toISOString(),
    },
  ];

  saveDb();
}

loadOrSeedDb();

// JWT Middleware
interface AuthRequest extends Request {
  user?: User;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ message: 'Invalid or expired token.' });
      return;
    }
    const payload = decoded as { id: string; email: string };
    const user = db.users.find((u) => u.id === payload.id);
    if (!user) {
      res.status(401).json({ message: 'User not found.' });
      return;
    }
    req.user = user;
    next();
  });
}

// Optional Auth Middleware (for checking draft ownership)
function optionalAuthenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const payload = decoded as { id: string; email: string };
      const user = db.users.find((u) => u.id === payload.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  });
}

function sanitizeUser(user: User) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'DevSpace Backend API',
    database: isMongoConnected ? 'mongodb-connected' : 'active',
    timestamp: new Date().toISOString(),
  });
});

// AUTH: Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Please provide a valid name (at least 2 characters).' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      bio: 'Developer, writer, and tech enthusiast on DevSpace.',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(normalizedEmail)}`,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDb();

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: sanitizeUser(newUser),
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error while registering account.' });
  }
});

// AUTH: Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: sanitizeUser(user),
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// AUTH: Me
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.json({ user: sanitizeUser(req.user) });
});

// POSTS: Public published feed
app.get('/api/posts', (req: Request, res: Response) => {
  const { search, tag } = req.query;
  let results = db.posts.filter((p) => p.status === 'published');

  if (tag && typeof tag === 'string') {
    const filterTag = tag.toLowerCase().trim();
    results = results.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === filterTag || slugify(t) === filterTag)
    );
  }

  if (search && typeof search === 'string') {
    const query = search.toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        p.author.name.toLowerCase().includes(query)
    );
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(results);
});

// POSTS: Authenticated user's articles (drafts + published)
app.get('/api/posts/mine', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const myPosts = db.posts
    .filter((p) => p.authorId === userId)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  res.json(myPosts);
});

// POSTS: Single article detail (by slug or id)
app.get('/api/posts/:slug', optionalAuthenticateToken, (req: AuthRequest, res: Response) => {
  const slugOrId = req.params.slug;
  const post = db.posts.find((p) => p.slug === slugOrId || p.id === slugOrId);

  if (!post) {
    return res.status(404).json({ message: 'Article not found.' });
  }

  // If draft, only author can view it
  if (post.status === 'draft') {
    if (!req.user || req.user.id !== post.authorId) {
      return res.status(404).json({ message: 'Article not found or is in private draft.' });
    }
  }

  res.json(post);
});

// POSTS: Create article
app.post('/api/posts', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { title, content, coverImage, tags, status } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Article title is required.' });
    }
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Article content is required.' });
    }

    const postStatus: 'draft' | 'published' = status === 'draft' ? 'draft' : 'published';
    let baseSlug = slugify(title.trim());
    if (!baseSlug) baseSlug = `article-${Date.now()}`;

    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (db.posts.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const newPost: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      slug,
      content,
      coverImage: coverImage && typeof coverImage === 'string' ? coverImage.trim() : '/src/assets/images/bg_landing_tech_1793504993992.jpg',
      tags: cleanTags,
      status: postStatus,
      readingTime: calculateReadingTime(content),
      authorId: req.user!.id,
      author: {
        id: req.user!.id,
        name: req.user!.name,
        avatar: req.user!.avatar,
        bio: req.user!.bio,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.posts.push(newPost);
    saveDb();

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Internal server error creating article.' });
  }
});

// POSTS: Update article (server-side ownership check)
app.put('/api/posts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const postIndex = db.posts.findIndex((p) => p.id === postId || p.slug === postId);

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const post = db.posts[postIndex];

    // Enforce ownership
    if (post.authorId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to modify another author\'s article.' });
    }

    const { title, content, coverImage, tags, status } = req.body;

    if (title && typeof title === 'string' && title.trim().length > 0) {
      post.title = title.trim();
      // Only recalculate slug if changed substantially
      const newSlugBase = slugify(post.title);
      if (newSlugBase && !post.slug.startsWith(newSlugBase)) {
        let uniqueSlug = newSlugBase;
        let c = 1;
        while (db.posts.some((p) => p.slug === uniqueSlug && p.id !== post.id)) {
          uniqueSlug = `${newSlugBase}-${c++}`;
        }
        post.slug = uniqueSlug;
      }
    }

    if (typeof content === 'string') {
      post.content = content;
      post.readingTime = calculateReadingTime(content);
    }

    if (typeof coverImage === 'string') {
      post.coverImage = coverImage.trim();
    }

    if (tags !== undefined) {
      post.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }

    if (status === 'draft' || status === 'published') {
      post.status = status;
    }

    // Refresh author snapshot in case user updated name/avatar
    post.author = {
      id: req.user!.id,
      name: req.user!.name,
      avatar: req.user!.avatar,
      bio: req.user!.bio,
    };
    post.updatedAt = new Date().toISOString();

    db.posts[postIndex] = post;
    saveDb();

    res.json(post);
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ message: 'Internal server error updating article.' });
  }
});

// POSTS: Delete article (server-side ownership check)
app.delete('/api/posts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const postIndex = db.posts.findIndex((p) => p.id === postId || p.slug === postId);

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const post = db.posts[postIndex];

    // Enforce ownership
    if (post.authorId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to delete another author\'s article.' });
    }

    db.posts.splice(postIndex, 1);
    saveDb();

    res.json({ message: 'Article deleted successfully.' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: 'Internal server error deleting article.' });
  }
});

// POSTS: Toggle like on article
app.post('/api/posts/:id/like', authenticateToken, (req: AuthRequest, res: Response) => {
  const postId = req.params.id;
  const post = db.posts.find((p) => p.id === postId || p.slug === postId);
  if (!post) {
    return res.status(404).json({ message: 'Article not found.' });
  }
  if (!post.likes) post.likes = [];
  const userId = req.user!.id;
  const likedIndex = post.likes.indexOf(userId);
  if (likedIndex > -1) {
    post.likes.splice(likedIndex, 1);
  } else {
    post.likes.push(userId);
  }
  saveDb();
  res.json({ likes: post.likes, liked: likedIndex === -1, count: post.likes.length });
});

// POSTS: Toggle bookmark on article
app.post('/api/posts/:id/bookmark', authenticateToken, (req: AuthRequest, res: Response) => {
  const postId = req.params.id;
  const post = db.posts.find((p) => p.id === postId || p.slug === postId);
  if (!post) {
    return res.status(404).json({ message: 'Article not found.' });
  }
  if (!post.bookmarks) post.bookmarks = [];
  const userId = req.user!.id;
  const bookmarkIndex = post.bookmarks.indexOf(userId);
  if (bookmarkIndex > -1) {
    post.bookmarks.splice(bookmarkIndex, 1);
  } else {
    post.bookmarks.push(userId);
  }
  saveDb();
  res.json({ bookmarks: post.bookmarks, bookmarked: bookmarkIndex === -1, count: post.bookmarks.length });
});

// POSTS: Add comment to article
app.post('/api/posts/:id/comments', authenticateToken, (req: AuthRequest, res: Response) => {
  const postId = req.params.id;
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ message: 'Comment content cannot be empty.' });
  }
  const post = db.posts.find((p) => p.id === postId || p.slug === postId);
  if (!post) {
    return res.status(404).json({ message: 'Article not found.' });
  }
  if (!post.comments) post.comments = [];
  const newComment: Comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: req.user!.id,
    userName: req.user!.name,
    userAvatar: req.user!.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  post.comments.push(newComment);
  saveDb();
  res.status(201).json(newComment);
});

// POSTS: Get comments for article
app.get('/api/posts/:id/comments', (req: Request, res: Response) => {
  const postId = req.params.id;
  const post = db.posts.find((p) => p.id === postId || p.slug === postId);
  if (!post) {
    return res.status(404).json({ message: 'Article not found.' });
  }
  res.json(post.comments || []);
});

// POSTS: Get current user's bookmarked articles
app.get('/api/bookmarks/mine', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const bookmarkedPosts = db.posts.filter((p) => p.status === 'published' && p.bookmarks && p.bookmarks.includes(userId));
  res.json(bookmarkedPosts);
});

// TAGS: Public tags with published counts
app.get('/api/tags', (req: Request, res: Response) => {
  const publishedPosts = db.posts.filter((p) => p.status === 'published');
  const tagCounts: Record<string, { name: string; slug: string; count: number }> = {};

  for (const post of publishedPosts) {
    for (const tag of post.tags) {
      const trimmed = tag.trim();
      const slug = slugify(trimmed);
      if (!slug) continue;
      if (!tagCounts[slug]) {
        tagCounts[slug] = {
          name: trimmed,
          slug,
          count: 0,
        };
      }
      tagCounts[slug].count += 1;
    }
  }

  const result = Object.values(tagCounts).sort((a, b) => b.count - a.count);
  res.json(result);
});

// TAGS: Posts filtered by tag slug
app.get('/api/tags/:slug/posts', (req: Request, res: Response) => {
  const targetSlug = req.params.slug.toLowerCase().trim();
  const matchingPosts = db.posts
    .filter(
      (p) =>
        p.status === 'published' &&
        p.tags.some((t) => slugify(t) === targetSlug || t.toLowerCase() === targetSlug)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(matchingPosts);
});

// USERS: Public author profile
app.get('/api/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'Author profile not found.' });
  }

  const publishedPosts = db.posts
    .filter((p) => p.authorId === user.id && p.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    user: sanitizeUser(user),
    posts: publishedPosts,
    articleCount: publishedPosts.length,
  });
});

// USERS: Update authenticated user's profile
app.put('/api/users/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, bio, avatar } = req.body;

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (typeof bio === 'string') {
      user.bio = bio.trim();
    }
    if (typeof avatar === 'string' && avatar.trim().length > 0) {
      user.avatar = avatar.trim();
    }

    // Update in database array
    const userIndex = db.users.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      db.users[userIndex] = user;
    }

    // Cascade update to authored posts' author snapshot
    for (const post of db.posts) {
      if (post.authorId === user.id) {
        post.author.name = user.name;
        post.author.avatar = user.avatar;
        post.author.bio = user.bio;
      }
    }

    saveDb();
    res.json({ user: sanitizeUser(user), message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Internal server error updating profile.' });
  }
});

// Vite or Static handling
async function startServer() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      isMongoConnected = true;
      console.log('Connected to MongoDB via Mongoose.');
    } catch (err: any) {
      console.warn('MongoDB connection note (using resilient fallback store):', err.message);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev mode, mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DevSpace server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
