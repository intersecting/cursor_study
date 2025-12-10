import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: ORIGIN }));
app.use(express.json());

type Role = 'admin' | 'teacher' | 'frontdesk' | 'student';
type User = { id: string; name: string; role: Role };

type Reservation = {
  id: string;
  title: string;
  start: string;
  end: string;
  studentId: string;
  roomId: string;
};

type Student = {
  id: string;
  name: string;
  phone?: string;
  guardianName?: string;
};

type Lesson = {
  id: string;
  title: string;
  teacherId: string;
  studentId: string;
  start: string;
  end: string;
  roomId?: string;
};

const users: Record<string, User> = {};
const reservations: Reservation[] = [];
const students: Student[] = [];
const lessons: Lesson[] = [];

function dateOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

app.post('/auth/login', (req, res) => {
  const { phone, password } = req.body || {};
  if (!phone || !password) {
    return res.status(400).json({ message: 'phone and password required' });
  }
  const user: User = users[phone] ?? { id: randomUUID(), name: phone, role: 'admin' };
  users[phone] = user;
  res.json({ token: 'dummy-token', user });
});

app.get('/reservations', (req, res) => {
  const { start, end, roomId, studentId } = req.query as Record<string, string | undefined>;
  if (!start || !end) return res.status(400).json({ message: 'start and end required' });
  const startDate = new Date(start);
  const endDate = new Date(end);
  const filtered = reservations.filter((r) => {
    if (roomId && r.roomId !== roomId) return false;
    if (studentId && r.studentId !== studentId) return false;
    return dateOverlap(startDate, endDate, new Date(r.start), new Date(r.end));
  });
  res.json(filtered);
});

app.post('/reservations', (req, res) => {
  const { title, start, end, roomId, studentId } = req.body || {};
  if (!title || !start || !end || !roomId || !studentId) {
    return res.status(400).json({ message: 'title/start/end/roomId/studentId required' });
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  const conflict = reservations.find((r) =>
    dateOverlap(startDate, endDate, new Date(r.start), new Date(r.end))
  );
  if (conflict) {
    return res.status(409).json({ message: 'time slot conflict with another student', conflictId: conflict.id });
  }
  const created: Reservation = { id: randomUUID(), title, start, end, roomId, studentId };
  reservations.push(created);
  res.status(201).json(created);
});

// Students CRUD (minimal)
app.get('/students', (_req, res) => res.json(students));

app.post('/students', (req, res) => {
  const { name, phone, guardianName } = req.body || {};
  if (!name) return res.status(400).json({ message: 'name required' });
  const student: Student = { id: randomUUID(), name, phone, guardianName };
  students.push(student);
  res.status(201).json(student);
});

// Lessons (schedule)
app.get('/lessons', (req, res) => {
  const { start, end, teacherId, studentId } = req.query as Record<string, string | undefined>;
  if (!start || !end) return res.status(400).json({ message: 'start and end required' });
  const startDate = new Date(start);
  const endDate = new Date(end);
  const filtered = lessons.filter((l) => {
    if (teacherId && l.teacherId !== teacherId) return false;
    if (studentId && l.studentId !== studentId) return false;
    return dateOverlap(startDate, endDate, new Date(l.start), new Date(l.end));
  });
  res.json(filtered);
});

app.post('/lessons', (req, res) => {
  const { title, teacherId, studentId, start, end, roomId } = req.body || {};
  if (!title || !teacherId || !studentId || !start || !end) {
    return res.status(400).json({ message: 'title/teacherId/studentId/start/end required' });
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  const conflict = lessons.find((l) =>
    dateOverlap(startDate, endDate, new Date(l.start), new Date(l.end))
  );
  if (conflict) return res.status(409).json({ message: 'lesson time conflict', conflictId: conflict.id });
  const lesson: Lesson = { id: randomUUID(), title, teacherId, studentId, start, end, roomId };
  lessons.push(lesson);
  res.status(201).json(lesson);
});

app.get('/', (_req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

