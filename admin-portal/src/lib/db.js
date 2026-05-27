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
  limit,
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

// ==================== BOOTCAMPS ====================
export async function createBootcamp(data) {
  const docRef = await addDoc(collection(db, 'bootcamps'), {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export async function getBootcamp(bootcampId) {
  const docSnap = await getDoc(doc(db, 'bootcamps', bootcampId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}
export async function getAllBootcamps() {
  const snap = await getDocs(query(collection(db, 'bootcamps'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function updateBootcamp(bootcampId, data) {
  await updateDoc(doc(db, 'bootcamps', bootcampId), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteBootcamp(bootcampId) {
  await deleteDoc(doc(db, 'bootcamps', bootcampId));
}
export function subscribeToBootcamps(callback) {
  return onSnapshot(
    query(collection(db, 'bootcamps'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

// ==================== VOLUNTEERS ====================
export async function addVolunteer(bootcampId, data) {
  const docRef = await addDoc(collection(db, 'bootcamps', bootcampId, 'volunteers'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export async function getVolunteers(bootcampId) {
  const snap = await getDocs(query(collection(db, 'bootcamps', bootcampId, 'volunteers'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function subscribeToVolunteers(bootcampId, callback) {
  return onSnapshot(
    query(collection(db, 'bootcamps', bootcampId, 'volunteers'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function deleteVolunteer(bootcampId, volunteerId) {
  await deleteDoc(doc(db, 'bootcamps', bootcampId, 'volunteers', volunteerId));
}

// ==================== STUDENTS ====================
export async function addStudent(bootcampId, data) {
  const docRef = await addDoc(collection(db, 'bootcamps', bootcampId, 'students'), {
    ...data,
    totalPoints: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export async function getStudents(bootcampId) {
  const snap = await getDocs(query(collection(db, 'bootcamps', bootcampId, 'students'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function getStudentsByVolunteer(bootcampId, volunteerId) {
  const snap = await getDocs(
    query(collection(db, 'bootcamps', bootcampId, 'students'), where('volunteerId', '==', volunteerId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function subscribeToStudents(bootcampId, callback) {
  return onSnapshot(
    query(collection(db, 'bootcamps', bootcampId, 'students'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function updateStudent(bootcampId, studentId, data) {
  const batch = writeBatch(db);
  const studentRef = doc(db, 'bootcamps', bootcampId, 'students', studentId);
  batch.update(studentRef, data);
  if (data.level) {
    const userRef = doc(db, 'users', studentId);
    batch.update(userRef, { level: data.level });
  }
  await batch.commit();
}
export async function deleteStudent(bootcampId, studentId) {
  await deleteDoc(doc(db, 'bootcamps', bootcampId, 'students', studentId));
}
export async function updateOwnBootcampProfile(bootcampId, uid, role, data) {
  const batch = writeBatch(db);
  if (role === 'student') {
    batch.set(doc(db, 'bootcamps', bootcampId, 'students', uid), data, { merge: true });
    if (data.displayName) {
      batch.set(doc(db, 'bootcamps', bootcampId, 'leaderboard', uid), { displayName: data.displayName, lastUpdated: serverTimestamp() }, { merge: true });
    }
  }
  if (role === 'volunteer') {
    batch.set(doc(db, 'bootcamps', bootcampId, 'volunteers', uid), data, { merge: true });
  }
  await batch.commit();
}
export function subscribeToStudent(bootcampId, studentId, callback) {
  return onSnapshot(doc(db, 'bootcamps', bootcampId, 'students', studentId), (docSnap) => {
    if (docSnap.exists()) callback({ id: docSnap.id, ...docSnap.data() });
  });
}

// ==================== TEAMS ====================
export async function createTeam(bootcampId, data) {
  const docRef = await addDoc(collection(db, 'bootcamps', bootcampId, 'teams'), {
    ...data,
    totalPoints: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export async function getTeams(bootcampId) {
  const snap = await getDocs(query(collection(db, 'bootcamps', bootcampId, 'teams'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function subscribeToTeams(bootcampId, callback) {
  return onSnapshot(
    query(collection(db, 'bootcamps', bootcampId, 'teams'), orderBy('totalPoints', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

// ==================== MODULES (New Structure) ====================
export async function createModule(data) {
  const docRef = await addDoc(collection(db, 'modules'), {
    ...data,
    version: 1,
    deleted: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export async function getModule(moduleId) {
  const docSnap = await getDoc(doc(db, 'modules', moduleId));
  if (!docSnap.exists() || docSnap.data().deleted) return null;
  return { id: docSnap.id, ...docSnap.data() };
}
export async function getModulesByBootcamp(bootcampId) {
  const q = query(collection(db, 'modules'), where('bootcampId', '==', bootcampId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.filter(d => !d.deleted).sort((a, b) => (a.order || 0) - (b.order || 0));
}
export async function updateModule(moduleId, data) {
  await updateDoc(doc(db, 'modules', moduleId), { ...data, version: increment(1), updatedAt: serverTimestamp() });
}
export async function deleteModule(moduleId) {
  await updateDoc(doc(db, 'modules', moduleId), { deleted: true, deletedAt: serverTimestamp() });
}

// ==================== DAYS (New Structure) ====================
export async function createDay(data) {
  const docRef = await addDoc(collection(db, 'days'), {
    ...data,
    version: 1,
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
export async function getDaysByModule(moduleId) {
  const q = query(collection(db, 'days'), where('moduleId', '==', moduleId));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.filter(d => !d.deleted).sort((a, b) => (a.order || 0) - (b.order || 0));
}
export async function getAllDays() {
  const q = query(collection(db, 'days'), where('deleted', '==', false), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function updateDay(dayId, data) {
  await updateDoc(doc(db, 'days', dayId), { ...data, version: increment(1), updatedAt: serverTimestamp() });
}
export async function deleteDay(dayId) {
  await updateDoc(doc(db, 'days', dayId), { deleted: true, deletedAt: serverTimestamp() });
}

// ==================== USER PROGRESS (New Structure) ====================
export async function getUserProgress(userId, dayId) {
  const docId = `${userId}_${dayId}`;
  const docSnap = await getDoc(doc(db, 'user_progress', docId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}
export function subscribeToUserProgress(userId, callback) {
  const q = query(collection(db, 'user_progress'), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
export async function updateUserProgress(userId, dayId, moduleId, progressData) {
  const docId = `${userId}_${dayId}`;
  const progressRef = doc(db, 'user_progress', docId);
  const progressSnap = await getDoc(progressRef);
  const prevData = progressSnap.exists() ? progressSnap.data() : {
    userId, dayId, moduleId, videoCompleted: false, quizCompleted: false, submissionCompleted: false, overallCompleted: false, watchPercentage: 0, quizScore: 0,
  };
  const updated = { ...prevData, ...progressData, updatedAt: serverTimestamp() };
  updated.overallCompleted = updated.videoCompleted && updated.quizCompleted && updated.submissionCompleted;
  if (updated.overallCompleted && !prevData.overallCompleted) {
    updated.completedAt = serverTimestamp();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const completedDays = userSnap.data().completedDays || [];
      if (!completedDays.includes(dayId)) {
        await updateDoc(userRef, { completedDays: [...completedDays, dayId] });
      }
    }
  }
  await setDoc(progressRef, updated, { merge: true });
  await updateStreak(userId);
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
  if (lastActiveDate === todayStr) return;
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
export async function submitQuizAttempt(userId, dayId, moduleId, attemptData) {
  const daySnap = await getDoc(doc(db, 'days', dayId));
  const version = daySnap.exists() ? daySnap.data().version || 1 : 1;
  const attemptRef = await addDoc(collection(db, 'quiz_attempts'), {
    userId, dayId, moduleId, ...attemptData, version, completedAt: serverTimestamp(),
  });
  await updateUserProgress(userId, dayId, moduleId, { quizCompleted: true, quizScore: attemptData.score });
  return attemptRef.id;
}

// ==================== REVIEWS / DAILY FEEDBACK ====================
export async function submitDailyReview(userId, dayId, moduleId, reviewData) {
  const reviewRef = await addDoc(collection(db, 'reviews'), {
    userId, dayId, moduleId, ...reviewData, visible: true, flagged: false, reviewedByAdmin: false, createdAt: serverTimestamp(),
  });
  return reviewRef.id;
}
export async function getReviewsByDay(dayId) {
  const q = query(collection(db, 'reviews'), where('dayId', '==', dayId), where('visible', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ==================== ANNOUNCEMENTS ====================
export async function createAnnouncement(data) {
  const docRef = await addDoc(collection(db, 'announcements'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}
export async function getAnnouncements(bootcampId) {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return list.filter(ann => ann.visibleTo === 'all' || ann.visibleTo === bootcampId);
}

// ==================== DEVICE SESSION TRACKING ====================
export async function logUserSession(userId, sessionData) {
  const sessionRef = await addDoc(collection(db, 'user_sessions'), { userId, ...sessionData, lastLoginAt: serverTimestamp(), active: true });
  return sessionRef.id;
}

// ==================== GLOBAL SETTINGS ====================
export async function getGlobalSettings() {
  const docSnap = await getDoc(doc(db, 'settings', 'global'));
  if (!docSnap.exists()) {
    const defaults = {
      uploadLimits: { image: 10 * 1024 * 1024, video: 50 * 1024 * 1024 },
      quizTimer: 15, maxVideoSize: 50, streakRules: { dailyActivities: ['video', 'quiz', 'submission'] },
      platformBranding: { title: 'Circuitron Bootcamp' }, maintenanceMode: false,
    };
    await setDoc(doc(db, 'settings', 'global'), defaults);
    return defaults;
  }
  return docSnap.data();
}
export async function updateGlobalSettings(data) {
  await setDoc(doc(db, 'settings', 'global'), data, { merge: true });
}

// ==================== LEADERBOARD ====================
export function subscribeToLeaderboard(bootcampId, callback) {
  return onSnapshot(
    query(collection(db, 'bootcamps', bootcampId, 'leaderboard'), orderBy('totalPoints', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function initLeaderboardEntry(bootcampId, entityId, data) {
  await setDoc(doc(db, 'bootcamps', bootcampId, 'leaderboard', entityId), {
    ...data, totalPoints: 0, lastUpdated: serverTimestamp(),
  });
}

// ==================== TASKS (Legacy / UI) ====================
export async function createTask(bootcampId, data) {
  const docRef = await addDoc(collection(db, 'bootcamps', bootcampId, 'tasks'), { ...data, type: 'core', status: 'active', createdAt: serverTimestamp() });
  return docRef.id;
}
export async function getTasks(bootcampId) {
  const snap = await getDocs(query(collection(db, 'bootcamps', bootcampId, 'tasks'), where('status', '==', 'active'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function subscribeToTasks(bootcampId, callback) {
  return onSnapshot(
    query(collection(db, 'bootcamps', bootcampId, 'tasks'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function updateTask(bootcampId, taskId, data) {
  await updateDoc(doc(db, 'bootcamps', bootcampId, 'tasks', taskId), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteTask(bootcampId, taskId) {
  await updateDoc(doc(db, 'bootcamps', bootcampId, 'tasks', taskId), { status: 'archived' });
}

// ==================== TUTORIALS (Legacy) ====================
export async function createTutorial(bootcampId, taskId, data) {
  const docRef = await addDoc(collection(db, 'bootcamps', bootcampId, 'tasks', taskId, 'tutorials'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}
export async function getTutorials(bootcampId, taskId) {
  const snap = await getDocs(query(collection(db, 'bootcamps', bootcampId, 'tasks', taskId, 'tutorials'), orderBy('order', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function subscribeToTutorials(bootcampId, taskId, callback) {
  return onSnapshot(
    query(collection(db, 'bootcamps', bootcampId, 'tasks', taskId, 'tutorials'), orderBy('order', 'asc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function updateTutorial(bootcampId, taskId, tutorialId, data) {
  await updateDoc(doc(db, 'bootcamps', bootcampId, 'tasks', taskId, 'tutorials', tutorialId), data);
}
export async function deleteTutorial(bootcampId, taskId, tutorialId) {
  await deleteDoc(doc(db, 'bootcamps', bootcampId, 'tasks', taskId, 'tutorials', tutorialId));
}

// ==================== SUBTASKS (Legacy) ====================
export async function createSubtask(bootcampId, taskId, data) {
  const docRef = await addDoc(collection(db, 'bootcamps', bootcampId, 'tasks', taskId, 'subtasks'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}
export async function getSubtasks(bootcampId, taskId) {
  const snap = await getDocs(query(collection(db, 'bootcamps', bootcampId, 'tasks', taskId, 'subtasks'), orderBy('order', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function subscribeToSubtasks(bootcampId, taskId, callback) {
  return onSnapshot(
    query(collection(db, 'bootcamps', bootcampId, 'tasks', taskId, 'subtasks'), orderBy('order', 'asc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function updateSubtask(bootcampId, taskId, subtaskId, data) {
  await updateDoc(doc(db, 'bootcamps', bootcampId, 'tasks', taskId, 'subtasks', subtaskId), data);
}
export async function deleteSubtask(bootcampId, taskId, subtaskId) {
  await deleteDoc(doc(db, 'bootcamps', bootcampId, 'tasks', taskId, 'subtasks', subtaskId));
}

// ==================== SUBMISSIONS ====================
export async function createSubmission(bootcampId, data) {
  const docRef = await addDoc(collection(db, 'bootcamps', bootcampId, 'submissions'), {
    ...data, status: 'pending', pointsAwarded: 0, submittedAt: serverTimestamp(),
  });
  return docRef.id;
}
export async function saveSubmissionDraft(bootcampId, userId, dayId, draftData) {
  const docId = draftData.projectGroupId ? `${userId}_${draftData.projectGroupId}` : `${userId}_${dayId}`;
  const submissionRef = doc(db, 'bootcamps', bootcampId, 'submissions', docId);
  await setDoc(submissionRef, { userId, studentId: userId, dayId, ...draftData, status: 'draft', updatedAt: serverTimestamp() }, { merge: true });
}
export async function submitTaskNew(bootcampId, userId, dayId, submissionData) {
  const docId = submissionData.projectGroupId ? `${userId}_${submissionData.projectGroupId}` : `${userId}_${dayId}`;
  const submissionRef = doc(db, 'bootcamps', bootcampId, 'submissions', docId);
  const daySnap = await getDoc(doc(db, 'days', dayId));
  const version = daySnap.exists() ? daySnap.data().version || 1 : 1;
  await setDoc(submissionRef, { userId, studentId: userId, dayId, ...submissionData, status: 'submitted', version, submittedAt: serverTimestamp() }, { merge: true });
  await updateUserProgress(userId, dayId, submissionData.moduleId, { submissionCompleted: true });
}
export async function getSubmission(bootcampId, userId, dayId, projectGroupId = null) {
  const docId = projectGroupId ? `${userId}_${projectGroupId}` : `${userId}_${dayId}`;
  const docSnap = await getDoc(doc(db, 'bootcamps', bootcampId, 'submissions', docId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}
export async function getSubmissions(bootcampId, filters = {}) {
  let q = collection(db, 'bootcamps', bootcampId, 'submissions');
  const constraints = [orderBy('submittedAt', 'desc')];
  if (filters.taskId) constraints.unshift(where('taskId', '==', filters.taskId));
  if (filters.dayId) constraints.unshift(where('dayId', '==', filters.dayId));
  if (filters.studentId) constraints.unshift(where('studentId', '==', filters.studentId));
  if (filters.status) constraints.unshift(where('status', '==', filters.status));
  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export function subscribeToSubmissions(bootcampId, callback, filters = {}) {
  let constraints = [orderBy('submittedAt', 'desc')];
  if (filters.taskId) constraints.unshift(where('taskId', '==', filters.taskId));
  if (filters.dayId) constraints.unshift(where('dayId', '==', filters.dayId));
  if (filters.studentId) constraints.unshift(where('studentId', '==', filters.studentId));
  if (filters.status) constraints.unshift(where('status', '==', filters.status));
  return onSnapshot(
    query(collection(db, 'bootcamps', bootcampId, 'submissions'), ...constraints),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
export async function reviewSubmission(bootcampId, submissionId, reviewData) {
  const submissionRef = doc(db, 'bootcamps', bootcampId, 'submissions', submissionId);
  const submissionDoc = await getDoc(submissionRef);
  if (!submissionDoc.exists()) return;
  const submission = submissionDoc.data();
  const wasApproved = submission.status === 'approved';
  const isApproving = reviewData.status === 'approved';
  const shouldAwardPoints = isApproving && !wasApproved && (reviewData.pointsAwarded || 0) > 0;
  
  const batch = writeBatch(db);
  batch.update(submissionRef, { ...reviewData, reviewedAt: serverTimestamp() });
  
  if (shouldAwardPoints) {
    const studentRef = doc(db, 'bootcamps', bootcampId, 'students', submission.studentId || submission.userId);
    batch.update(studentRef, { totalPoints: increment(reviewData.pointsAwarded) });
    const leaderboardRef = doc(db, 'bootcamps', bootcampId, 'leaderboard', submission.studentId || submission.userId);
    const lbDoc = await getDoc(leaderboardRef);
    if (lbDoc.exists()) {
      batch.update(leaderboardRef, { totalPoints: increment(reviewData.pointsAwarded), lastUpdated: serverTimestamp() });
    }
  }
  await batch.commit();

  if (submission.dayId && submission.moduleId) {
    const submissionCompleted = reviewData.status === 'approved';
    await updateUserProgress(submission.userId || submission.studentId, submission.dayId, submission.moduleId, {
      submissionCompleted,
    });
  }
}
