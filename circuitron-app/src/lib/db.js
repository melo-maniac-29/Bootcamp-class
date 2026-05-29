import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== UTILITY ====================
export function getISTDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const year = parts.find(p => p.type === 'year').value;
  return `${year}-${month}-${day}`;
}

// ==================== WEEKS ====================
export async function createWeek(data) {
  const docRef = await addDoc(collection(db, 'weeks'), {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToWeeks(callback) {
  return onSnapshot(
    query(collection(db, 'weeks'), orderBy('order', 'asc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function updateWeek(weekId, data) {
  await updateDoc(doc(db, 'weeks', weekId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteWeek(weekId) {
  await updateDoc(doc(db, 'weeks', weekId), { deleted: true, updatedAt: serverTimestamp() });
}

// ==================== DAYS ====================
export async function createDay(data) {
  const docRef = await addDoc(collection(db, 'days'), {
    weekId: data.weekId,
    title: data.title,
    description: data.description || '',
    videoUrl: data.videoUrl || '',
    videoTitle: data.videoTitle || '',
    references: data.references || [],
    unlockAt: data.unlockAt,
    deadlineAt: data.deadlineAt,
    order: data.order,
    taskDescription: data.taskDescription || '',
    taskRequirements: data.taskRequirements || [],
    deleted: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getDay(dayId) {
  const docSnap = await getDoc(doc(db, 'days', dayId));
  if (!docSnap.exists() || docSnap.data().deleted) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export function subscribeToDays(weekId, callback) {
  return onSnapshot(
    query(
      collection(db, 'days'),
      where('weekId', '==', weekId)
    ),
    (snap) => {
      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => !d.deleted)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(results);
    }
  );
}

export function subscribeToAllDays(callback) {
  return onSnapshot(
    collection(db, 'days'),
    (snap) => {
      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => !d.deleted)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(results);
    }
  );
}

export async function updateDay(dayId, data) {
  await updateDoc(doc(db, 'days', dayId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDay(dayId) {
  await updateDoc(doc(db, 'days', dayId), { deleted: true, updatedAt: serverTimestamp() });
}

// ==================== USERS (PARTICIPANTS & ADMINS) ====================
export async function getUser(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getUserByParticipantId(participantId) {
  const q = query(collection(db, 'users'), where('participantId', '==', participantId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export function subscribeToUsers(callback) {
  return onSnapshot(
    query(collection(db, 'users'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function updateUser(uid, data) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

// ==================== USER PROGRESS ====================
export async function getUserProgress(userId, dayId) {
  const docId = `${userId}_${dayId}`;
  const docSnap = await getDoc(doc(db, 'userProgress', docId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export function subscribeToUserProgress(userId, callback) {
  return onSnapshot(
    query(collection(db, 'userProgress'), where('userId', '==', userId)),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function updateUserProgress(userId, dayId, progressData) {
  const docId = `${userId}_${dayId}`;
  const progressRef = doc(db, 'userProgress', docId);
  const progressSnap = await getDoc(progressRef);

  const existing = progressSnap.exists() ? progressSnap.data() : {};

  // Always default boolean fields to false to prevent undefined values
  const prevData = {
    userId,
    dayId,
    videoCompleted: existing.videoCompleted || false,
    quizCompleted: existing.quizCompleted || false,
    submissionCompleted: existing.submissionCompleted || false,
    overallCompleted: existing.overallCompleted || false,
    videoWatchPercent: existing.videoWatchPercent || 0,
  };

  const updated = { ...prevData, ...progressData, updatedAt: serverTimestamp() };
  updated.overallCompleted = !!(updated.videoCompleted && updated.quizCompleted && updated.submissionCompleted);

  if (updated.overallCompleted && !prevData.overallCompleted) {
    updated.completedAt = serverTimestamp();
    await updateStreak(userId);
  }

  await setDoc(progressRef, updated, { merge: true });
  return updated;
}

// ==================== STREAK SYSTEM ====================
export async function updateStreak(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const userData = userSnap.data();
  const todayStr = getISTDateString();
  const lastActiveDate = userData.lastActiveDate || '';
  let streakCount = userData.streakCount || 0;

  if (lastActiveDate === todayStr) return; // Already updated today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getISTDateString(yesterday);

  if (lastActiveDate === yesterdayStr) {
    streakCount += 1;
  } else {
    streakCount = 1;
  }
  await updateDoc(userRef, { streakCount, lastActiveDate: todayStr, updatedAt: serverTimestamp() });
}

// ==================== QUIZZES ====================
export async function createQuiz(dayId, data) {
  const quizRef = doc(db, 'quizzes', dayId);
  await setDoc(quizRef, {
    dayId,
    questions: data.questions || [],
    createdAt: serverTimestamp(),
  });
  return dayId;
}

export async function getQuiz(dayId) {
  const docSnap = await getDoc(doc(db, 'quizzes', dayId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateQuiz(dayId, data) {
  await updateDoc(doc(db, 'quizzes', dayId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteQuiz(dayId) {
  await deleteDoc(doc(db, 'quizzes', dayId));
}

// ==================== QUIZ ATTEMPTS ====================
export async function submitQuizAttempt(userId, dayId, attemptData) {
  const docId = `${userId}_${dayId}`;
  const attemptRef = doc(db, 'quizAttempts', docId);
  await setDoc(attemptRef, {
    userId,
    dayId,
    ...attemptData,
    completedAt: serverTimestamp(),
  });
  await updateUserProgress(userId, dayId, { quizCompleted: true });
  return docId;
}

export async function getQuizAttempt(userId, dayId) {
  const docId = `${userId}_${dayId}`;
  const docSnap = await getDoc(doc(db, 'quizAttempts', docId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export function subscribeToQuizAttempts(filters = {}, callback) {
  return onSnapshot(
    collection(db, 'quizAttempts'),
    (snap) => {
      let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (filters.dayId) results = results.filter(r => r.dayId === filters.dayId);
      results.sort((a, b) => {
        const aTime = a.completedAt?.toDate?.() || new Date(0);
        const bTime = b.completedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      callback(results);
    }
  );
}

// ==================== SUBMISSIONS ====================
export async function submitTask(userId, dayId, submissionData) {
  const docId = `${userId}_${dayId}`;
  const submissionRef = doc(db, 'submissions', docId);

  await setDoc(submissionRef, {
    userId,
    dayId,
    ...submissionData,
    status: 'Pending Review',
    submittedAt: serverTimestamp(),
  }, { merge: true });

  await updateUserProgress(userId, dayId, { submissionCompleted: true });
}

export async function getSubmission(userId, dayId) {
  const docId = `${userId}_${dayId}`;
  const docSnap = await getDoc(doc(db, 'submissions', docId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export function subscribeToSubmissions(filters = {}, callback) {
  return onSnapshot(
    collection(db, 'submissions'),
    (snap) => {
      let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (filters.status) results = results.filter(r => r.status === filters.status);
      if (filters.dayId) results = results.filter(r => r.dayId === filters.dayId);
      if (filters.userId) results = results.filter(r => r.userId === filters.userId);
      results.sort((a, b) => {
        const aTime = a.submittedAt?.toDate?.() || new Date(0);
        const bTime = b.submittedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      callback(results);
    }
  );
}

export function subscribeToUserSubmissions(userId, callback) {
  return onSnapshot(
    query(
      collection(db, 'submissions'),
      where('userId', '==', userId)
    ),
    (snap) => {
      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.submittedAt?.toDate?.() || new Date(0);
          const bTime = b.submittedAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
      callback(results);
    }
  );
}

// ==================== REVIEWS ====================
export async function reviewSubmission(submissionId, reviewData) {
  const submissionRef = doc(db, 'submissions', submissionId);
  const submissionDoc = await getDoc(submissionRef);
  if (!submissionDoc.exists()) return;

  const submission = submissionDoc.data();

  const batch = writeBatch(db);
  batch.update(submissionRef, { status: reviewData.status, reviewedAt: serverTimestamp() });

  const reviewRef = doc(collection(db, 'reviews'));
  batch.set(reviewRef, {
    submissionId,
    userId: submission.userId,
    dayId: submission.dayId,
    ...reviewData,
    createdAt: serverTimestamp(),
  });

  if (reviewData.status === 'Needs Revision') {
    const progressId = `${submission.userId}_${submission.dayId}`;
    const progressRef = doc(db, 'userProgress', progressId);
    batch.update(progressRef, { submissionCompleted: false, overallCompleted: false });
  }

  await batch.commit();
}

// ==================== ANNOUNCEMENTS ====================
export async function createAnnouncement(data) {
  const docRef = await addDoc(collection(db, 'announcements'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export function subscribeToAnnouncements(callback) {
  return onSnapshot(
    query(collection(db, 'announcements'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function deleteAnnouncement(announcementId) {
  await deleteDoc(doc(db, 'announcements', announcementId));
}

// ==================== SETTINGS ====================
export async function getGlobalSettings() {
  const docSnap = await getDoc(doc(db, 'settings', 'global'));
  if (!docSnap.exists()) {
    const defaults = { maintenanceMode: false };
    await setDoc(doc(db, 'settings', 'global'), defaults);
    return defaults;
  }
  return docSnap.data();
}

export async function updateGlobalSettings(data) {
  await setDoc(doc(db, 'settings', 'global'), data, { merge: true });
}

// ==================== VIDEO PROGRESS ====================
export async function updateVideoProgress(userId, dayId, data) {
  const docId = `${userId}_${dayId}`;
  const progressRef = doc(db, 'userProgress', docId);
  await setDoc(progressRef, {
    userId,
    dayId,
    videoWatchPercent: data.videoWatchPercent || 0,
    videoCompleted: data.videoCompleted || false,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getVideoProgress(userId, dayId) {
  const docId = `${userId}_${dayId}`;
  const docSnap = await getDoc(doc(db, 'userProgress', docId));
  if (!docSnap.exists()) return null;
  const progressData = docSnap.data();
  return {
    videoWatchPercent: progressData.videoWatchPercent || 0,
    videoCompleted: progressData.videoCompleted || false,
  };
}

// ==================== DAY STATE HELPER ====================
export function getDayState(day, userProgress) {
  const now = new Date();

  // Check if unlockAt is in the future → LOCKED
  if (day.unlockAt) {
    const unlockDate = day.unlockAt.toDate ? day.unlockAt.toDate() : new Date(day.unlockAt);
    if (unlockDate > now) return 'LOCKED';
  }

  // Check if user has completed this day
  if (userProgress?.overallCompleted === true) return 'COMPLETED';

  // Check if deadline has passed → EXPIRED
  if (day.deadlineAt) {
    const deadlineDate = day.deadlineAt.toDate ? day.deadlineAt.toDate() : new Date(day.deadlineAt);
    if (deadlineDate <= now) return 'EXPIRED';
  }

  // Otherwise → ACTIVE
  return 'ACTIVE';
}
