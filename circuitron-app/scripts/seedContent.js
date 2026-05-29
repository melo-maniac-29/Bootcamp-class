const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const dbAdmin = admin.firestore();

// Helper: get a Date offset by N days from now
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seedContent() {
  console.log('🌱 Starting content seed...\n');

  // ==================== WEEKS ====================
  const weeksData = [
    {
      title: 'Week 1: Getting Started with Arduino',
      order: 1,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      title: 'Week 2: Sensors & Communication',
      order: 2,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  const weekIds = [];
  for (const week of weeksData) {
    const ref = await dbAdmin.collection('weeks').add(week);
    weekIds.push(ref.id);
    console.log(`✅ Created week: "${week.title}" (${ref.id})`);
  }

  // ==================== DAYS ====================
  const daysData = [
    {
      weekId: weekIds[0],
      title: 'Day 1: Introduction to Arduino & Blinking LED',
      description: 'Learn the basics of Arduino hardware, the IDE setup, and write your first program to blink an LED. Understand digital output pins, delay functions, and the structure of an Arduino sketch.',
      videoUrl: 'https://www.youtube.com/watch?v=fJWR7dBuc18',
      videoTitle: 'Arduino Tutorial for Beginners - Getting Started',
      references: [
        { title: 'Arduino Official Getting Started Guide', url: 'https://www.arduino.cc/en/Guide' },
        { title: 'Arduino Language Reference', url: 'https://www.arduino.cc/reference/en/' },
        { title: 'Tinkercad Circuits Simulator', url: 'https://www.tinkercad.com/circuits' },
      ],
      unlockAt: daysFromNow(-1),
      deadlineAt: daysFromNow(1),
      order: 1,
      taskDescription: 'Build and upload the Blink sketch to your Arduino. Modify it to blink at different speeds (100ms, 500ms, 2000ms). Take a photo or video of the result and submit.',
      taskRequirements: [
        'Working Blink sketch uploaded to Arduino',
        'Modified blink speed in at least 3 variations',
        'Photo or short video showing the blinking LED',
      ],
      deleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      weekId: weekIds[0],
      title: 'Day 2: Digital Inputs & Push Buttons',
      description: 'Learn how to read digital inputs using push buttons. Understand pull-up and pull-down resistors, digitalRead(), and debouncing concepts. Build a circuit that toggles an LED with a button.',
      videoUrl: 'https://www.youtube.com/watch?v=AgQW81zzR18',
      videoTitle: 'Arduino Push Button Tutorial - Digital Input',
      references: [
        { title: 'Arduino digitalRead() Reference', url: 'https://www.arduino.cc/reference/en/language/functions/digital-io/digitalread/' },
        { title: 'Pull-up/Pull-down Resistors Explained', url: 'https://learn.sparkfun.com/tutorials/pull-up-resistors' },
      ],
      unlockAt: daysFromNow(0),
      deadlineAt: daysFromNow(2),
      order: 2,
      taskDescription: 'Wire a push button to your Arduino and write code so that pressing the button toggles an LED on and off. Implement basic debouncing. Submit your code and a photo of the wiring.',
      taskRequirements: [
        'Correctly wired push button circuit with pull-down resistor',
        'Working toggle LED code with debounce logic',
        'Submitted Arduino sketch (.ino) file',
      ],
      deleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      weekId: weekIds[1],
      title: 'Day 3: Analog Sensors & Serial Monitor',
      description: 'Explore analog inputs by reading sensor values with analogRead(). Use the Serial Monitor to debug and display data. Connect a potentiometer or light sensor to control an LED brightness.',
      videoUrl: 'https://www.youtube.com/watch?v=nMFHzgCY0ns',
      videoTitle: 'Arduino Analog Input & Serial Monitor Tutorial',
      references: [
        { title: 'Arduino analogRead() Reference', url: 'https://www.arduino.cc/reference/en/language/functions/analog-io/analogread/' },
        { title: 'Serial Communication Guide', url: 'https://www.arduino.cc/reference/en/language/functions/communication/serial/' },
        { title: 'Arduino Sensor Kit Documentation', url: 'https://sensorkit.arduino.cc/' },
      ],
      unlockAt: daysFromNow(2),
      deadlineAt: daysFromNow(4),
      order: 3,
      taskDescription: 'Connect a potentiometer to your Arduino and use analogRead() to control LED brightness via analogWrite(). Print sensor values to the Serial Monitor. Submit your code and a video demo.',
      taskRequirements: [
        'Potentiometer correctly wired to analog input pin',
        'LED brightness controlled by potentiometer value',
        'Serial Monitor output showing sensor values',
      ],
      deleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      weekId: weekIds[1],
      title: 'Day 4: I2C Communication & LCD Display',
      description: 'Learn the I2C communication protocol and interface a 16x2 LCD display with your Arduino. Display sensor readings, custom messages, and scrolling text on the LCD.',
      videoUrl: 'https://www.youtube.com/watch?v=4E-_VJdh_gA',
      videoTitle: 'Arduino I2C LCD Display Tutorial',
      references: [
        { title: 'LiquidCrystal I2C Library', url: 'https://www.arduino.cc/reference/en/libraries/liquidcrystal-i2c/' },
        { title: 'I2C Communication Explained', url: 'https://learn.sparkfun.com/tutorials/i2c' },
      ],
      unlockAt: daysFromNow(3),
      deadlineAt: daysFromNow(5),
      order: 4,
      taskDescription: 'Connect a 16x2 I2C LCD to your Arduino. Display a welcome message on line 1 and a live sensor reading on line 2. Submit your code and a photo of the LCD output.',
      taskRequirements: [
        'I2C LCD correctly wired (SDA, SCL, VCC, GND)',
        'Custom text displayed on LCD line 1',
        'Live sensor reading updating on LCD line 2',
      ],
      deleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  const dayIds = [];
  for (const day of daysData) {
    const ref = await dbAdmin.collection('days').add(day);
    dayIds.push(ref.id);
    console.log(`✅ Created day: "${day.title}" (${ref.id})`);
  }

  // ==================== QUIZZES ====================
  const quizzesData = [
    {
      dayId: dayIds[0],
      questions: [
        {
          question: 'What function is used to set a pin as OUTPUT in Arduino?',
          options: ['digitalRead()', 'pinMode()', 'analogWrite()', 'Serial.begin()'],
          correctAnswer: 1,
          timeLimit: 15,
        },
        {
          question: 'What does the delay(1000) function do?',
          options: ['Delays for 1 second', 'Delays for 1 millisecond', 'Delays for 10 seconds', 'Resets the board'],
          correctAnswer: 0,
          timeLimit: 15,
        },
        {
          question: 'Which pin number is the built-in LED connected to on most Arduino Uno boards?',
          options: ['Pin 0', 'Pin 5', 'Pin 13', 'Pin A0'],
          correctAnswer: 2,
          timeLimit: 15,
        },
        {
          question: 'What are the two main functions required in every Arduino sketch?',
          options: ['start() and run()', 'setup() and loop()', 'begin() and end()', 'init() and execute()'],
          correctAnswer: 1,
          timeLimit: 15,
        },
        {
          question: 'What voltage does a HIGH digital output provide on Arduino Uno?',
          options: ['3.3V', '1.8V', '5V', '12V'],
          correctAnswer: 2,
          timeLimit: 15,
        },
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      dayId: dayIds[1],
      questions: [
        {
          question: 'What function reads the state of a digital pin?',
          options: ['analogRead()', 'digitalRead()', 'pinMode()', 'Serial.read()'],
          correctAnswer: 1,
          timeLimit: 15,
        },
        {
          question: 'What is the purpose of a pull-down resistor?',
          options: [
            'To increase voltage to the pin',
            'To keep the pin at a known LOW state when the button is not pressed',
            'To limit current to the LED',
            'To convert analog to digital signals',
          ],
          correctAnswer: 1,
          timeLimit: 15,
        },
        {
          question: 'What is "debouncing" in the context of push buttons?',
          options: [
            'Making the button bounce physically',
            'Filtering out rapid signal fluctuations when a button is pressed',
            'Connecting two buttons together',
            'Resetting the Arduino after a button press',
          ],
          correctAnswer: 1,
          timeLimit: 15,
        },
        {
          question: 'Which value does digitalRead() return when a button connected with a pull-down resistor is pressed?',
          options: ['LOW', 'HIGH', '0.5', 'ANALOG'],
          correctAnswer: 1,
          timeLimit: 15,
        },
        {
          question: 'What is the typical resistance value used for a pull-down resistor?',
          options: ['100 Ω', '1 kΩ', '10 kΩ', '1 MΩ'],
          correctAnswer: 2,
          timeLimit: 15,
        },
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const quiz of quizzesData) {
    await dbAdmin.collection('quizzes').doc(quiz.dayId).set(quiz);
    console.log(`✅ Created quiz for day: ${quiz.dayId}`);
  }

  console.log('\n--------------------------------------------------');
  console.log('🎉 Content seed completed successfully!');
  console.log(`   ${weekIds.length} weeks created`);
  console.log(`   ${dayIds.length} days created`);
  console.log(`   ${quizzesData.length} quizzes created`);
  console.log('--------------------------------------------------');
  console.log('\nWeek IDs:', weekIds);
  console.log('Day IDs:', dayIds);
}

seedContent().catch((error) => {
  console.error('❌ Error seeding content:', error);
  process.exit(1);
});
