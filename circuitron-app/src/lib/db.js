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

// ==================== PROGRAMS ====================
export async function createProgram(data) {
  const docRef = await addDoc(collection(db, 'programs'), {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export async function getProgram(programId) {
  const docSnap = await getDoc(doc(db, 'programs', programId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}
export function subscribeToPrograms(callback) {
  return onSnapshot(
    query(collection(db, 'programs'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function updateProgram(programId, data) {
  await updateDoc(doc(db, 'programs', programId), { ...data, updatedAt: serverTimestamp() });
}

// ==================== BATCHES ====================
export async function createBatch(data) {
  const docRef = await addDoc(collection(db, 'batches'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export function subscribeToBatches(programId, callback) {
  return onSnapshot(
    query(collection(db, 'batches'), where('programId', '==', programId), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function updateBatch(batchId, data) {
  await updateDoc(doc(db, 'batches', batchId), { ...data, updatedAt: serverTimestamp() });
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

// ==================== MODULES ====================
export async function createModule(data) {
  const docRef = await addDoc(collection(db, 'modules'), {
    ...data,
    deleted: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export function subscribeToModules(batchId, callback) {
  return onSnapshot(
    query(collection(db, 'modules'), where('batchId', '==', batchId), where('deleted', '==', false), orderBy('order', 'asc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function updateModule(moduleId, data) {
  await updateDoc(doc(db, 'modules', moduleId), { ...data, updatedAt: serverTimestamp() });
}

// ==================== DAYS ====================
export async function createDay(data) {
  const docRef = await addDoc(collection(db, 'days'), {
    ...data,
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
export function subscribeToDays(moduleId, callback) {
  return onSnapshot(
    query(collection(db, 'days'), where('moduleId', '==', moduleId), where('deleted', '==', false), orderBy('order', 'asc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function updateDay(dayId, data) {
  await updateDoc(doc(db, 'days', dayId), { ...data, updatedAt: serverTimestamp() });
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
  
  const prevData = progressSnap.exists() ? progressSnap.data() : {
    userId, dayId, videoCompleted: false, quizCompleted: false, submissionCompleted: false, overallCompleted: false
  };
  
  const updated = { ...prevData, ...progressData, updatedAt: serverTimestamp() };
  updated.overallCompleted = updated.videoCompleted && updated.quizCompleted && updated.submissionCompleted;
  
  if (updated.overallCompleted && !prevData.overallCompleted) {
    updated.completedAt = serverTimestamp();
    // Update streaks
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

// ==================== QUIZ ATTEMPTS ====================
export async function submitQuizAttempt(userId, dayId, attemptData) {
  const attemptRef = await addDoc(collection(db, 'quizAttempts'), {
    userId, dayId, ...attemptData, completedAt: serverTimestamp(),
  });
  await updateUserProgress(userId, dayId, { quizCompleted: true });
  return attemptRef.id;
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
    submittedAt: serverTimestamp() 
  }, { merge: true });
  
  await updateUserProgress(userId, dayId, { submissionCompleted: true });
}
export function subscribeToSubmissions(filters = {}, callback) {
  let constraints = [orderBy('submittedAt', 'desc')];
  if (filters.status) constraints.unshift(where('status', '==', filters.status));
  if (filters.dayId) constraints.unshift(where('dayId', '==', filters.dayId));
  if (filters.userId) constraints.unshift(where('userId', '==', filters.userId));
  
  return onSnapshot(
    query(collection(db, 'submissions'), ...constraints),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
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
    createdAt: serverTimestamp()
  });
  
  if (reviewData.status === 'Approved') {
    // Progress is already marked true upon submission, but we might want to track if it drops back to Needs Revision
  } else if (reviewData.status === 'Needs Revision') {
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
