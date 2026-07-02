import { ProcessedLesson } from "../types";

export const INITIAL_PROCESSED_LESSON: ProcessedLesson = {
  lessonTitle: "Rocket Science & Newton's 3rd Law",
  duration: "45-60 minutes",
  summary: "An interactive, high-energy exploration of aerospace propulsion. Students will discover how objects move in space and build their own balloon-propelled rockets to test the physics of thrust!",
  keyTakeaways: [
    "Forces always come in matched pairs: Action and Reaction.",
    "Rockets move forward by pushing fuel out backward—not by pushing against the air.",
    "Triangles and streamlined shapes maximize speed and reduce atmospheric drag.",
    "Robert Goddard proved that physics works perfectly in the airless vacuum of space."
  ],
  slides: [
    {
      title: "How Do Rockets Fly?",
      content: [
        "Rockets carry their own fuel and oxygen inside combustion chambers.",
        "Burning fuel creates high-pressure gas that rushes out of the nozzle backwards.",
        "The rushing gas pushes the rocket body forward in the opposite direction!"
      ],
      visualConcept: "A detailed cutaway diagram of a chemical rocket engine. Large arrows show fuel and oxidizer mixing in the combustion chamber, igniting, and rushing out of the flared nozzle (colored in hot orange/red) creating a massive green thrust arrow pointing upward.",
      instructorNotes: "Start with a playful question: 'If there's no air in space to push against, how does a rocket steer?' Wait for answers, then blow up a balloon and let it go to show them the answer!"
    },
    {
      title: "Newton's Third Law of Motion",
      content: [
        "For every Action, there is an equal and opposite Reaction.",
        "Action: Rocket nozzle ejects exhaust gases downward.",
        "Reaction: Rocket body gets pushed upward with equal force (thrust)."
      ],
      visualConcept: "An animated split-screen: On the left, a foot pushing backward on a skateboard, making the skateboard go forward. On the right, a giant Saturn V rocket lifting off, with huge fire arrows pointing down labeled 'Action' and a giant rocket arrow pointing up labeled 'Reaction'.",
      instructorNotes: "Ask two students to stand on wheeled chairs or skateboards (safely) and push against each other's hands. What happens? Both roll backward! This is Action-Reaction."
    },
    {
      title: "The Genius of Robert Goddard",
      content: [
        "In 1920, newspapers mocked Robert Goddard, saying rockets couldn't fly in space because there is no air.",
        "He proved that rockets actually fly BETTER in space!",
        "Why? Because there is zero air resistance (drag) to slow them down."
      ],
      visualConcept: "A split space diagram. One side has a rocket in dense blue atmosphere with friction waves. The other side has a rocket in deep black outer space, moving completely smoothly with zero friction waves, surrounded by glowing stars.",
      instructorNotes: "Highlight that sometimes people will tell you your ideas are impossible. Robert Goddard ignored the critics and built the first liquid-fueled rocket anyway!"
    },
    {
      title: "Friction & Streamlining",
      content: [
        "Air looks empty, but it's full of gas molecules that collide with moving objects.",
        "We call this air resistance or atmospheric drag.",
        "Streamlined shapes (pointed cones, thin fins) slice through air molecules easily."
      ],
      visualConcept: "Comparison graphic. Shape A: A flat-nosed cardboard box pushing through air with chaotic red turbulence lines piling up in front of it. Shape B: A pointed needle-nosed rocket with smooth blue air flowlines wrapping perfectly around its fins.",
      instructorNotes: "Have students rub their hands together as fast as they can. Do they feel warmth? That is friction! Rockets feel air friction too, which is why they must be sharp and smooth."
    }
  ],
  handsOnActivity: {
    title: "The Great Balloon Rocket Race",
    materials: [
      "12-inch latex balloons (high stretch)",
      "15-foot nylon fishing line (the track)",
      "Standard plastic drinking straw",
      "Cellulose tape (Scotch tape)",
      "Metal binder clips or clothespins",
      "Measuring tape or ruler"
    ],
    steps: [
      "Secure one end of the nylon fishing line to a heavy chair or door handle.",
      "Thread the plastic straw onto the line, then pull the line tight and tie the other end across the room.",
      "Blow up your balloon completely, but DO NOT tie it. Clamp the nozzle shut with a binder clip.",
      "Tape the inflated balloon securely to the straw using 3 pieces of tape, making sure the balloon points straight.",
      "Slide the straw-balloon assembly back to the starting line.",
      "Unclamp the binder clip and watch your rocket fly! Measure and record the distance traveled."
    ],
    scientificPrinciple: "When you release the clip, the stretched latex squeezes the air out of the nozzle (Action). The escaping air pushes forward against the inside of the balloon, launching the balloon-straw car along the fishing line in the opposite direction (Reaction)!"
  },
  worksheet: {
    title: "Balloon Rocket Physics Lab Guide",
    instructions: "Complete this worksheet as you run your Balloon Rocket experiment. Observe carefully!",
    questions: [
      {
        id: "Q1",
        questionText: "According to Newton's Third Law, if the 'Action' is air rushing out of the balloon nozzle to the LEFT, what is the 'Reaction'?",
        answerType: "Short Answer",
        sampleAnswer: "The reaction is the balloon rocket moving to the RIGHT with equal force."
      },
      {
        id: "Q2",
        questionText: "How does the size of the balloon (amount of air) affect the distance it travels? Select your hypothesis:",
        answerType: "Multiple Choice",
        options: [
          "More air = More thrust = Travels further",
          "Less air = Lighter weight = Travels further",
          "Air volume has absolutely no effect on distance"
        ],
        sampleAnswer: "More air = More thrust = Travels further (because more mass is ejected, creating more momentum)."
      },
      {
        id: "Q3",
        questionText: "If we added a heavy weight (like a metal paperclip) to our balloon rocket, would it travel faster or slower? Why?",
        answerType: "Short Answer",
        sampleAnswer: "It would travel slower because more mass requires more force to accelerate (Newton's Second Law: F=ma)."
      }
    ]
  },
  quiz: [
    {
      question: "What is Newton's Third Law of Motion?",
      options: [
        "Gravity pulls everything down at the exact same rate.",
        "For every action, there is an equal and opposite reaction.",
        "Objects in motion will stay in motion forever.",
        "Force is equal to mass multiplied by acceleration."
      ],
      correctAnswerIndex: 1,
      explanation: "Newton's Third Law states that forces always exist in matched action-reaction pairs!"
    },
    {
      question: "In a real chemical rocket, what is the 'Action'?",
      options: [
        "The astronauts waving goodbye.",
        "The computer calculating the trajectory.",
        "High-pressure exhaust gas rushing out of the nozzle backward.",
        "The sound of the engines roaring."
      ],
      correctAnswerIndex: 2,
      explanation: "Ejecting high-pressure exhaust gas at extreme speed is the ACTION that pushes the rocket forward!"
    },
    {
      question: "Why do rockets fly BETTER in the vacuum of space than in air?",
      options: [
        "Because there is no gravity in space.",
        "Because there is no air resistance (friction) to slow them down.",
        "Because space is much colder and cools the engines.",
        "Because rocket fuel burns faster in space."
      ],
      correctAnswerIndex: 1,
      explanation: "Air creates atmospheric drag (friction). Space is a vacuum, meaning there are no air molecules to crash into, allowing rockets to glide effortlessly!"
    },
    {
      question: "Who was mocked in 1920 for proposing that rockets could fly in a vacuum?",
      options: [
        "Isaac Newton",
        "Albert Einstein",
        "Robert Goddard",
        "Elon Musk"
      ],
      correctAnswerIndex: 2,
      explanation: "The New York Times mocked Robert Goddard in an editorial, which they famously retracted in 1969 when Apollo 11 landed on the moon!"
    }
  ],
  mediaRecommendations: [
    {
      resourceType: "Video Demonstration",
      suggestedSearchQuery: "Apollo 11 Saturn V Launch Ultra HD slow motion",
      whyItHelps: "Shows beautiful slow-motion visual of Newton's 3rd law in action, capturing the extreme velocity of fire rushing down while the massive rocket lifts up."
    },
    {
      resourceType: "Interactive Web App",
      suggestedSearchQuery: "PhET Balloon Rocket Simulation physics html5",
      whyItHelps: "A high-quality interactive virtual simulation that allows kids to change rocket mass, thrust, and angle on a digital smart-board if physical materials are limited."
    }
  ]
};
