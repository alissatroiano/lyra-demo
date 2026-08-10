export interface SupplyOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export const CATEGORY_SUPPLIES: Record<string, SupplyOption[]> = {
  Gaming: [
    { id: "Minecraft Education", label: "Minecraft Education", icon: "⛏️", description: "3D block building, Agent & MakeCode" },
    { id: "Roblox Studio", label: "Roblox Studio", icon: "🎮", description: "Lua 3D world building & game scripting" },
    { id: "Scratch 3.0", label: "Scratch 3.0", icon: "🚀", description: "Interactive 2D sprite games & physics" },
    { id: "Scratch JR", label: "Scratch JR", icon: "🐱", description: "Ages 5-7 tablet story & game blocks" },
    { id: "Code.org Game Lab", label: "Code.org Game Lab", icon: "💻", description: "2D game mechanics & animations" },
    { id: "EduBlocks", label: "EduBlocks", icon: "🧱", description: "Drag & drop Python game scripts" },
    { id: "Unreal / Unity", label: "Unreal / Unity", icon: "🕹️", description: "Advanced 3D engine physics" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom gaming engine or platform" }
  ],
  Circuitry: [
    { id: "DC Motors", label: "DC Motors", icon: "⚙️", description: "3V-12V hobby motors" },
    { id: "LED Lights", label: "LED Lights", icon: "💡", description: "Colored LEDs (5mm)" },
    { id: "Copper Tape / Wire", label: "Copper Tape / Wire", icon: "⚡", description: "Conductive tracks & wires" },
    { id: "Batteries (AA/9V/Coin)", label: "Batteries", icon: "🔋", description: "AA, 9V, or CR2032 Coin cells" },
    { id: "Breadboards", label: "Breadboards", icon: "🔌", description: "Solderless prototyping boards" },
    { id: "Alligator Clips", label: "Alligator Clips", icon: "🧲", description: "Quick connector cables" },
    { id: "Switches & Resistors", label: "Switches & Resistors", icon: "🎛️", description: "Current control & toggle switches" },
    { id: "Conductive Dough", label: "Conductive Dough", icon: "🧪", description: "Squishy circuits clay" },
    { id: "Buzzers & Speakers", label: "Buzzers & Speakers", icon: "🔊", description: "Piezo sound generators" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom electronics or hardware" }
  ],
  Software: [
    { id: "Scratch JR", label: "Scratch JR", icon: "🐱", description: "Ages 5-7 tablet block programming" },
    { id: "Minecraft Education", label: "Minecraft", icon: "⛏️", description: "3D block building & MakeCode" },
    { id: "Scratch 3.0", label: "Scratch", icon: "🚀", description: "Interactive sprites & games" },
    { id: "EduBlocks", label: "EduBlocks", icon: "🧱", description: "Drag & drop Python & HTML" },
    { id: "Thunkable", label: "Thunkable", icon: "📱", description: "No-code mobile app builder" },
    { id: "Code.org", label: "Code.org", icon: "💻", description: "K-12 CS puzzles & games" },
    { id: "Micro:bit / MakeCode", label: "Micro:bit", icon: "👾", description: "Block/Python microcontroller" },
    { id: "Roblox Studio", label: "Roblox Studio", icon: "🎮", description: "Lua 3D world creation" },
    { id: "Python", label: "Python", icon: "🐍", description: "Text-based programming" },
    { id: "Other", label: "Other", icon: "➕", description: "Search grounded custom software" }
  ],
  Hardware: [
    { id: "Arduino / Micro:bit", label: "Arduino / Micro:bit", icon: "🤖", description: "Programmable boards" },
    { id: "Servo Motors", label: "Servo Motors", icon: "🦾", description: "180° / continuous rotation servos" },
    { id: "Ultrasonic Sensors", label: "Ultrasonic Sensors", icon: "📡", description: "HC-SR04 distance sensors" },
    { id: "Jumper Wires", label: "Jumper Wires", icon: "🔌", description: "Male-to-female jumper pins" },
    { id: "3D Printer", label: "3D Printer", icon: "🖨️", description: "PLA filament 3D models" },
    { id: "Lego Spike / Mindstorms", label: "Lego Robotics", icon: "🧱", description: "Lego motors & brick hubs" },
    { id: "Motor Driver Shield", label: "Motor Driver Shield", icon: "🔋", description: "L298N / Adafruit motor shields" },
    { id: "Cardboard Chassis", label: "Cardboard Chassis", icon: "📦", description: "Laser-cut or handmade frames" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom mechanical parts" }
  ],
  Engineering: [
    { id: "Popsicle Sticks", label: "Popsicle Sticks", icon: "🪵", description: "Wooden craft sticks" },
    { id: "Rubber Bands", label: "Rubber Bands", icon: "➰", description: "Elastic tension bands" },
    { id: "Hot Glue Guns", label: "Hot Glue Guns", icon: "🔫", description: "Low-temp craft glue" },
    { id: "Cardboard Boxes", label: "Cardboard", icon: "📦", description: "Corrugated shipping boxes" },
    { id: "Plastic Cups", label: "Plastic Cups", icon: "🥤", description: "Building towers & catapults" },
    { id: "String & Straws", label: "String & Straws", icon: "🥤", description: "Pulley lines & structural struts" },
    { id: "Marbles & Balls", label: "Marbles & Balls", icon: "🔮", description: "Rube Goldberg & rollercoasters" },
    { id: "Bottle Caps & Wheels", label: "Bottle Caps", icon: "⭕", description: "Axles & wheel assemblies" },
    { id: "Pulleys & Gears", label: "Pulleys & Gears", icon: "⚙️", description: "Simple machines & mechanical advantage" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom engineering items" }
  ],
  Science: [
    { id: "Smart Board", label: "Smart Board", icon: "🖥️", description: "Interactive classroom display" },
    { id: "Chromebooks / Tablets", label: "Chromebooks/Tablets", icon: "💻", description: "Digital research & virtual labs" },
    { id: "Baking Soda & Vinegar", label: "Baking Soda & Vinegar", icon: "🧪", description: "Acid-base gas reactions" },
    { id: "Test Tubes & Flasks", label: "Test Tubes & Flasks", icon: "🥼", description: "Graduated cylinders & beakers" },
    { id: "Magnifying Glasses", label: "Magnifying Glasses", icon: "🔍", description: "Micro-observation lenses" },
    { id: "Safety Goggles", label: "Safety Goggles", icon: "🥽", description: "Eye protection equipment" },
    { id: "Measuring Cups & Pipettes", label: "Measuring Pipettes", icon: "🧪", description: "Precision liquid dropper tools" },
    { id: "Plant Seeds & Soil", label: "Plant Seeds & Soil", icon: "🌱", description: "Botany & germination kits" },
    { id: "Low Tech (Paper Only)", label: "Low Tech Paper", icon: "📄", description: "Origami & paper mechanics" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom lab equipment" }
  ],
  Art: [
    { id: "Canva", label: "Canva", icon: "🎨", description: "Digital design, graphics, slide decks & posters" },
    { id: "Cardstock & Paper", label: "Cardstock & Paper", icon: "📄", description: "Heavyweight craft paper" },
    { id: "Clay & Sculpting", label: "Clay & Sculpting", icon: "🏺", description: "Sculpting clay, air-dry clay & playdough" },
    { id: "Paints & Brushes", label: "Paints & Brushes", icon: "🖌️", description: "Washable tempera & acrylic" },
    { id: "Markers & Pastels", label: "Markers & Pastels", icon: "🖍️", description: "Coloring markers & oil pastels" },
    { id: "Scissors & Adhesives", label: "Scissors & Adhesives", icon: "✂️", description: "Safety scissors & tape" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom art materials" }
  ],
  DigitalArt: [
    { id: "Canva", label: "Canva", icon: "🎨", description: "Digital design, graphics, slide decks & posters" },
    { id: "Digital Drawing Tablet", label: "Drawing Tablet", icon: "✏️", description: "Stylus & digital canvas software" },
    { id: "Tinkercad 3D Design", label: "Tinkercad 3D", icon: "🧊", description: "3D digital modeling & design" },
    { id: "Procreate / Sketchbook", label: "Procreate / Sketchbook", icon: "🖌️", description: "Digital painting & illustration" },
    { id: "Pixel Art / Piskel", label: "Pixel Art / Piskel", icon: "👾", description: "Sprite design & 2D pixel art" },
    { id: "Scratch Vector Paint", label: "Scratch Paint Editor", icon: "🚀", description: "Vector graphic sprite customization" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom digital art application" }
  ],
  FineArt: [
    { id: "Cardstock & Paper", label: "Cardstock & Paper", icon: "📄", description: "Heavyweight craft paper" },
    { id: "Clay & Sculpting", label: "Clay & Sculpting", icon: "🏺", description: "Sculpting clay, air-dry clay & playdough" },
    { id: "Paints & Brushes", label: "Paints & Brushes", icon: "🖌️", description: "Washable tempera & acrylics" },
    { id: "Markers & Pastels", label: "Markers & Pastels", icon: "🖍️", description: "Coloring markers & oil pastels" },
    { id: "Scissors & Adhesives", label: "Scissors & Adhesives", icon: "✂️", description: "Safety scissors, glue & tape" },
    { id: "Craft Decor & Textiles", label: "Craft Decor", icon: "👀", description: "Felt, pipe cleaners, feathers & sequins" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom fine art supplies" }
  ],
  Math: [
    { id: "Graph Paper", label: "Graph Paper", icon: "📊", description: "Grid coordinate sheets" },
    { id: "Pattern Blocks", label: "Pattern Blocks", icon: "📐", description: "Geometric tan grams & tiles" },
    { id: "Rulers & Tape Measure", label: "Rulers & Tape", icon: "📏", description: "Linear & spatial measurement" },
    { id: "Dice & Counters", label: "Dice & Counters", icon: "🎲", description: "Probability & arithmetic tokens" },
    { id: "Protractors", label: "Protractors", icon: "📐", description: "Angle measurement tools" },
    { id: "Calculators", label: "Calculators", icon: "🧮", description: "Standard / scientific calculators" },
    { id: "Other", label: "Other", icon: "➕", description: "Custom math manipulatives" }
  ]
};
