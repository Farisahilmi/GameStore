const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const categories = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Shooter', 
  'Simulation', 'Sports', 'Racing', 'Indie', 'Horror',
  'Puzzle', 'Fighting', 'Platformer', 'Survival', 'Open World',
  'Sci-Fi', 'Fantasy', 'Sandbox', 'Stealth', 'Battle Royale',
  'Competitive', 'Co-op', 'Anime', 'Story Rich', 'Mystery', 
  'Roguelike', 'Space'
];

const gamesData = [
  // --- BEST SELLERS / AAA ---
  {
    title: "Helldivers 2",
    description: "The Galaxy's Last Line of Offence. Enlist in the Helldivers and join the fight for freedom across a hostile galaxy in a fast, frantic, third-person shooter.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg",
    categories: ["Action", "Shooter", "Sci-Fi"]
  },
  {
    title: "Palworld",
    description: "Fight, farm, build and work alongside mysterious creatures called 'Pals' in this completely new multiplayer, open world survival and crafting game!",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg",
    categories: ["Survival", "Open World", "Indie"]
  },
  {
    title: "Baldur's Gate 3",
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
    categories: ["RPG", "Strategy", "Fantasy"]
  },
  {
    title: "Elden Ring",
    description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    categories: ["RPG", "Open World", "Fantasy"]
  },
  {
    title: "Cyberpunk 2077",
    description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamor, and relentless body modification.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    categories: ["RPG", "Open World", "Sci-Fi"],
    videoUrl: "https://cdn.pixabay.com/video/2023/10/15/185090-874636683_large.mp4"
  },
  {
    title: "Starfield",
    description: "Starfield is the first new universe in 25 years from Bethesda Game Studios, the award-winning creators of The Elder Scrolls V: Skyrim and Fallout 4.",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg",
    categories: ["RPG", "Open World", "Sci-Fi", "Space"],
    videoUrl: "https://cdn.pixabay.com/video/2021/08/04/83896-583206060_large.mp4"
  },
  {
    title: "Call of Duty®: Modern Warfare® III",
    description: "In the direct sequel to the record-breaking Call of Duty®: Modern Warfare® II, Captain Price and Task Force 141 face off against the ultimate threat.",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2519060/header.jpg",
    categories: ["Action", "Shooter"],
    videoUrl: "https://cdn.pixabay.com/video/2020/05/25/40139-424075573_large.mp4"
  },
  {
    title: "Red Dead Redemption 2",
    description: "Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, RDR2 is the epic tale of outlaw Arthur Morgan and the infamous Van der Linde gang, on the run across America at the dawn of the modern age.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
    categories: ["Action", "Adventure", "Open World"]
  },
  {
    title: "God of War",
    description: "His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters. It is in this harsh, unforgiving world that he must fight to survive… and teach his son to do the same.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg",
    categories: ["Action", "Adventure", "Fantasy"]
  },
  {
    title: "Hogwarts Legacy",
    description: "Hogwarts Legacy is an immersive, open-world action RPG set in the world first introduced in the Harry Potter books.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg",
    categories: ["RPG", "Open World", "Fantasy"]
  },
  {
    title: "Grand Theft Auto V",
    description: "Grand Theft Auto V for PC offers players the option to explore the award-winning world of Los Santos and Blaine County in resolutions of up to 4k and beyond, as well as the chance to experience the game running at 60 frames per second.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
    categories: ["Action", "Open World"]
  },
  {
    title: "The Witcher 3: Wild Hunt",
    description: "You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Your current contract? Tracking down the Child of Prophecy, a living weapon that can alter the shape of the world.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg",
    categories: ["RPG", "Open World", "Fantasy"]
  },

  // --- INDIE HITS ---
  {
    title: "Stardew Valley",
    description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.",
    price: 14.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg",
    categories: ["Simulation", "Indie", "RPG"]
  },
  {
    title: "Hollow Knight",
    description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style.",
    price: 14.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg",
    categories: ["Action", "Indie", "Platformer"]
  },
  {
    title: "Terraria",
    description: "Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game. The world is your canvas and the ground itself is your paint.",
    price: 9.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg",
    categories: ["Sandbox", "Survival", "Indie"]
  },
  {
    title: "Minecraft",
    description: "Explore infinite worlds and build everything from the simplest of homes to the grandest of castles. Play in creative mode with unlimited resources or mine deep into the world in survival mode, crafting weapons and armor to fend off dangerous mobs.",
    price: 29.99,
    coverImage: "https://image.api.playstation.com/vulcan/img/rnd/202010/2618/w48z6bzefZPrRcJHc7L8iStq.png",
    categories: ["Sandbox", "Survival", "Adventure", "Indie"]
  },
  {
    title: "Vampire Survivors",
    description: "Mow down thousands of night creatures and survive until dawn! Vampire Survivors is a gothic horror casual game with rogue-lite elements, where your choices can allow you to quickly snowball against the hundreds of monsters that are thrown at you.",
    price: 4.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1794680/header.jpg",
    categories: ["Action", "Indie", "RPG"]
  },
  {
    title: "Hades",
    description: "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion, Transistor, and Pyre.",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg",
    categories: ["Action", "Indie", "RPG"]
  },
  {
    title: "Among Us",
    description: "An online and local party game of teamwork and betrayal for 4-15 players... in space!",
    price: 4.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg",
    categories: ["Strategy", "Indie", "Sci-Fi"]
  },
  {
    title: "Phasmophobia",
    description: "Phasmophobia is a 4 player online co-op psychological horror. Paranormal activity is on the rise and it’s up to you and your team to use all the ghost hunting equipment at your disposal in order to gather as much evidence as you can.",
    price: 13.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/739630/header.jpg",
    categories: ["Horror", "Indie", "Co-op"]
  },
  {
    title: "Lethal Company",
    description: "A co-op horror about scavenging at abandoned moons to sell scrap to the Company.",
    price: 9.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1966720/header.jpg",
    categories: ["Horror", "Indie", "Sci-Fi"]
  },

  // --- SHOOTERS & ACTION ---
  {
    title: "Counter-Strike 2",
    description: "For over two decades, Counter-Strike has offered an elite competitive experience, one shaped by millions of players from across the globe. And now the next chapter in the CS story is about to begin. This is Counter-Strike 2.",
    price: 0.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
    categories: ["Action", "Shooter", "Competitive"]
  },
  {
    title: "Apex Legends™",
    description: "Apex Legends is the award-winning, free-to-play Hero Shooter from Respawn Entertainment. Master an ever-growing roster of legendary characters with powerful abilities, and experience strategic squad play and innovative gameplay in the next evolution of Hero Shooter and Battle Royale.",
    price: 0.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg",
    categories: ["Action", "Shooter", "Battle Royale"]
  },
  {
    title: "Destiny 2",
    description: "Dive into the world of Destiny 2 to explore the mysteries of the solar system and experience responsive first-person shooter combat. Unlock powerful elemental abilities and collect unique gear to customize your Guardian's look and playstyle.",
    price: 0.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1085660/header.jpg",
    categories: ["Action", "Shooter", "Sci-Fi"]
  },
  {
    title: "Rainbow Six Siege",
    description: "Tom Clancy's Rainbow Six Siege is the latest installment of the acclaimed first-person shooter franchise developed by the renowned Ubisoft Montreal studio.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/359550/header.jpg",
    categories: ["Action", "Shooter", "Strategy"]
  },
  {
    title: "Rust",
    description: "The only aim in Rust is to survive. Everything wants you to die - the island’s wildlife and other inhabitants, the environment, other survivors. Do whatever it takes to last another night.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg",
    categories: ["Survival", "Action", "Indie"]
  },
  {
    title: "PUBG: BATTLEGROUNDS",
    description: "Play PUBG: BATTLEGROUNDS for free. Land on strategic locations, loot weapons and supplies, and survive to become the last team standing across various, diverse Battlegrounds.",
    price: 0.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/578080/header.jpg",
    categories: ["Action", "Shooter", "Battle Royale"]
  },

  // --- STRATEGY & SIMULATION ---
  {
    title: "Civilization VI",
    description: "Civilization VI is the newest installment in the award winning Civilization Franchise. Expand your empire, advance your culture and go head-to-head against history’s greatest leaders. Will you stand the test of time?",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/289070/header.jpg",
    categories: ["Strategy", "Simulation"]
  },
  {
    title: "Cities: Skylines II",
    description: "Raise a city from the ground up and transform it into a thriving metropolis with the most realistic city builder ever. Push your creativity and problem-solving to build on a scale you've never experienced.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/949230/header.jpg",
    categories: ["Simulation", "Strategy"]
  },
  {
    title: "The Sims™ 4",
    description: "Play with life and discover the possibilities. Unleash your imagination and create a world of Sims that’s wholly unique. Explore and customize every detail from Sims to homes–and much more.",
    price: 0.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1222670/header.jpg",
    categories: ["Simulation", "Strategy"]
  },
  {
    title: "Factorio",
    description: "Factorio is a game about building and creating automated factories to produce items of increasing complexity, within an infinite 2D world.",
    price: 35.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/427520/header.jpg",
    categories: ["Simulation", "Strategy", "Indie"]
  },
  {
    title: "RimWorld",
    description: "A sci-fi colony sim driven by an intelligent AI storyteller. Generates stories by simulating psychology, ecology, gunplay, melee combat, climate, biomes, diplomacy, interpersonal relationships, art, medicine, trade, and more.",
    price: 34.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/294100/header.jpg",
    categories: ["Simulation", "Strategy", "Indie"]
  },
  {
    title: "Total War: WARHAMMER III",
    description: "The cataclysmic conclusion to the Total War: WARHAMMER trilogy is here. Rally your forces and step into the Realm of Chaos, a dimension of mind-bending horror where the very fate of the world will be decided. Will you conquer your Daemons… or command them?",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1142710/header.jpg",
    categories: ["Strategy", "Fantasy"]
  },

  // --- HORROR & SURVIVAL ---
  {
    title: "Dead by Daylight",
    description: "Dead by Daylight is a multiplayer (4vs1) horror game where one player takes on the role of the savage Killer, and the other four players play as Survivors, trying to escape the Killer and avoid being caught, tortured and killed.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/381210/header.jpg",
    categories: ["Horror", "Action", "Co-op"]
  },
  {
    title: "Resident Evil 4",
    description: "Survival is just the beginning. Six years have passed since the biological disaster in Raccoon City. Leon S. Kennedy, one of the survivors, tracks the president's kidnapped daughter to a secluded European village, where there is something terribly wrong with the locals.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg",
    categories: ["Action", "Horror", "Adventure"]
  },
  {
    title: "Sons Of The Forest",
    description: "Sent to find a missing billionaire on a remote island, you find yourself in a cannibal-infested hellscape. Craft, build, and struggle to survive, alone or with friends, in this terrifying new open-world survival horror simulator.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1326470/header.jpg",
    categories: ["Survival", "Horror", "Open World"]
  },
  {
    title: "Project Zomboid",
    description: "Project Zomboid is the ultimate open-ended zombie survival sandbox. Alone or in MP: you loot, build, craft, fight, farm and fish in a struggle to survive. A hardcore RPG skillset, a vast map, massively customisable sandbox and a cute tutorial raccoon await the unprepared. So how will you die?",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg",
    categories: ["Survival", "Simulation", "Indie"]
  },

  // --- SPORTS & RACING ---
  {
    title: "EA SPORTS FC™ 24",
    description: "EA SPORTS FC™ 24 welcomes you to The World’s Game: the most true-to-football experience ever with HyperMotionV, PlayStyles optimised by Opta, and an enhanced Frostbite™ Engine.",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2195250/header.jpg",
    categories: ["Sports", "Simulation"]
  },
  {
    title: "NBA 2K24",
    description: "Grab your squad and experience the past, present, and future of hoops culture in NBA 2K24. Enjoy loads of pure, unadulterated action and limitless personalized MyPLAYER options in MyCAREER. Collect an impressive array of legends and build your perfect lineup in MyTEAM.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2338770/header.jpg",
    categories: ["Sports", "Simulation"]
  },
  {
    title: "Forza Horizon 5",
    description: "Blast your way out of the festival and into the vibrant and ever-evolving open world landscapes of Mexico with limitless, fun driving action in hundreds of the world’s greatest cars.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg",
    categories: ["Racing", "Open World", "Simulation"]
  },
  {
    title: "F1® 23",
    description: "Be the last to brake in EA SPORTS™ F1® 23, the official video game of the 2023 FIA Formula One World Championship™.",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2108330/header.jpg",
    categories: ["Racing", "Sports", "Simulation"]
  },

  // --- FIGHTING ---
  {
    title: "Street Fighter™ 6",
    description: "Here comes Capcom’s newest challenger! Street Fighter™ 6 represents the next evolution of the Street Fighter™ series! It spans three distinct game modes: World Tour, Fighting Ground and Battle Hub.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1364780/header.jpg",
    categories: ["Fighting", "Action"]
  },
  {
    title: "TEKKEN 8",
    description: "TEKKEN 8, the brand-new entry in the legendary TEKKEN franchise, brings the fight to the new generation!",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1778820/header.jpg",
    categories: ["Fighting", "Action"]
  },
  {
    title: "Mortal Kombat 1",
    description: "Discover a reborn Mortal Kombat Universe created by the Fire God Liu Kang. Mortal Kombat 1 ushers in a new era of the iconic franchise with a new fighting system, game modes, and fatalities!",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1971870/header.jpg",
    categories: ["Fighting", "Action"]
  },

  // --- FILLER TITLES (CLASSICS & OTHERS to reach count) ---
  {
    title: "Left 4 Dead 2",
    description: "Set in the zombie apocalypse, Left 4 Dead 2 (L4D2) is the highly anticipated sequel to the award-winning Left 4 Dead, the #1 co-op game of 2008.",
    price: 9.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/550/header.jpg",
    categories: ["Action", "Horror", "Co-op"]
  },
  {
    title: "Portal 2",
    description: "The 'Perpetual Testing Initiative' has been expanded to allow you to design co-op puzzles for you and your friends!",
    price: 9.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/620/header.jpg",
    categories: ["Puzzle", "Adventure", "Co-op"]
  },
  {
    title: "Half-Life: Alyx",
    description: "Valve’s VR return to the Half-Life series. It’s the story of an impossible fight against a vicious alien race known as the Combine, set between the events of Half-Life and Half-Life 2.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/546560/header.jpg",
    categories: ["Action", "Sci-Fi", "Adventure"]
  },
  {
    title: "Dota 2",
    description: "Every day, millions of players worldwide enter battle as one of over a hundred Dota heroes. And no matter if it's their 10th hour of play or 1,000th, there's always something new to discover.",
    price: 0.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/570/header.jpg",
    categories: ["Strategy", "Action", "Competitive"]
  },
  {
    title: "Team Fortress 2",
    description: "Nine distinct classes provide a broad range of tactical abilities and personalities. Constantly updated with new game modes, maps, equipment and, most importantly, hats!",
    price: 0.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/440/header.jpg",
    categories: ["Action", "Shooter", "Competitive"]
  },
  {
    title: "Warframe",
    description: "Awaken as an unstoppable warrior and battle alongside your friends in this story-driven free-to-play online action game.",
    price: 0.00,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/230410/header.jpg",
    categories: ["Action", "RPG", "Sci-Fi"]
  },
  {
    title: "Monster Hunter: World",
    description: "Welcome to a new world! In Monster Hunter: World, the latest installment in the series, you can enjoy the ultimate hunting experience, using everything at your disposal to hunt monsters in a new world teeming with surprises and excitement.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg",
    categories: ["Action", "RPG", "Open World"]
  },
  {
    title: "ARK: Survival Evolved",
    description: "Stranded on the shores of a mysterious island, you must learn to survive. Use your cunning to kill or tame the primeval creatures roaming the land, and encounter other players to survive, dominate... and escape!",
    price: 14.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/346110/header.jpg",
    categories: ["Survival", "Open World", "Adventure"]
  },
  {
    title: "Valheim",
    description: "A brutal exploration and survival game for 1-10 players, set in a procedurally-generated purgatory inspired by viking culture. Battle, build, and conquer your way to a saga worthy of Odin’s patronage!",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/892970/header.jpg",
    categories: ["Survival", "Open World", "Indie"]
  },
  {
    title: "Sea of Thieves",
    description: "Sea of Thieves offers the essential pirate experience, from sailing and fighting to exploring and looting – everything you need to live the pirate life and become a legend in your own right.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1172620/header.jpg",
    categories: ["Adventure", "Action", "Open World"]
  },
  {
    title: "No Man's Sky",
    description: "No Man's Sky is a game about exploration and survival in an infinite procedurally generated universe.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/275850/header.jpg",
    categories: ["Adventure", "Sci-Fi", "Open World"]
  },
  {
    title: "Fallout 4",
    description: "Bethesda Game Studios, the award-winning creators of Fallout 3 and The Elder Scrolls V: Skyrim, welcome you to the world of Fallout 4 – their most ambitious game ever, and the next generation of open-world gaming.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg",
    categories: ["RPG", "Open World", "Sci-Fi"]
  },
  {
    title: "The Elder Scrolls V: Skyrim Special Edition",
    description: "Winner of more than 200 Game of the Year Awards, Skyrim Special Edition brings the epic fantasy to life in stunning detail. The Special Edition includes the critically acclaimed game and add-ons with all-new features like remastered art and effects.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/489830/header.jpg",
    categories: ["RPG", "Open World", "Fantasy"]
  },
  {
    title: "DayZ",
    description: "How long can you survive a post-apocalyptic world? A land overrun with an infected 'zombie' population, where you compete with other survivors for limited resources. Will you team up with strangers and stay strong together? Or play as a lone wolf to avoid betrayal? This is DayZ – this is your story.",
    price: 44.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/221100/header.jpg",
    categories: ["Survival", "Action", "Open World"]
  },
  {
    title: "7 Days to Die",
    description: "7 Days to Die is an open-world game that is a unique combination of first person shooter, survival horror, tower defense, and role-playing games. Play the definitive zombie survival sandbox RPG that came first. Navezgane awaits!",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/251570/header.jpg",
    categories: ["Survival", "Horror", "RPG"]
  },
  {
    title: "Euro Truck Simulator 2",
    description: "Travel across Europe as king of the road, a trucker who delivers important cargo across impressive distances! With dozens of cities to explore from the UK, Belgium, Germany, Italy, the Netherlands, Poland, and many more, your endurance, skill and speed will all be pushed to their limits.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/227300/header.jpg",
    categories: ["Simulation", "Racing"]
  },
  {
    title: "Dead Cells",
    description: "Dead Cells is a rogue-lite, metroidvania inspired action-platformer. You'll explore a sprawling, ever-changing castle... assuming you’re able to fight your way past its keepers in 2D souls-lite combat. No checkpoints. Kill, die, learn, repeat.",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/588650/header.jpg",
    categories: ["Action", "Indie", "Platformer"]
  },
  {
    title: "Slay the Spire",
    description: "We fused card games and roguelikes together to make the best single player deckbuilder we could. Craft a unique deck, encounter bizarre creatures, discover relics of immense power, and Slay the Spire!",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/646570/header.jpg",
    categories: ["Strategy", "Indie", "RPG"]
  },
  {
    title: "Risk of Rain 2",
    description: "Escape a chaotic alien planet by fighting through hordes of frenzied monsters – with your friends, or on your own. Combine loot in surprising ways and master each character until you become the havoc you feared upon your first crash landing.",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/632360/header.jpg",
    categories: ["Action", "Indie", "Sci-Fi"]
  },
  {
    title: "Subnautica",
    description: "Descend into the depths of an alien underwater world filled with wonder and peril. Craft equipment, pilot submarines and out-smart wildlife to explore lush coral reefs, volcanoes, cave systems, and more - all while trying to survive.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/264710/header.jpg",
    categories: ["Survival", "Adventure", "Open World"]
  },
  {
    title: "Don't Starve Together",
    description: "Fight, Farm, Build and Explore Together in the standalone multiplayer expansion to the uncompromising wilderness survival game, Don't Starve.",
    price: 14.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/322330/header.jpg",
    categories: ["Survival", "Indie", "Adventure"]
  },
  {
    title: "Cuphead",
    description: "Cuphead is a classic run and gun action game heavily focused on boss battles. Inspired by cartoons of the 1930s, the visuals and audio are painstakingly created with the same techniques of the era.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/268910/header.jpg",
    categories: ["Action", "Indie", "Platformer"]
  },
  {
    title: "Celeste",
    description: "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight, hand-crafted platformer from the creators of TowerFall.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg",
    categories: ["Action", "Indie", "Platformer"]
  },
  {
    title: "Undertale",
    description: "The RPG game where you don't have to destroy anyone.",
    price: 9.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/391540/header.jpg",
    categories: ["RPG", "Indie"]
  },
  {
    title: "Omori",
    description: "Explore a strange world full of colorful friends and foes. When the time comes, the path you've chosen will determine your fate... and perhaps the fate of others as well.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1150690/header.jpg",
    categories: ["RPG", "Indie", "Horror"]
  },
  {
    title: "Sekiro™: Shadows Die Twice",
    description: "Game of the Year - The Game Awards 2019 Best Action Game of 2019 - IGN Carve your own clever path to vengeance in the award winning adventure from developer FromSoftware, creators of Bloodborne and the Dark Souls series.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg",
    categories: ["Action", "Adventure"]
  },
  {
    title: "DARK SOULS™ III",
    description: "Dark Souls continues to push the boundaries with the latest, ambitious chapter in the critically-acclaimed and genre-defining series. Prepare yourself and Embrace The Darkness!",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg",
    categories: ["RPG", "Action", "Fantasy"]
  },
  {
    title: "Bloodborne™",
    description: "Hunt your nightmares as you search for answers in the ancient city of Yharnam, now cursed with a strange endemic illness spreading through the streets like wildfire.",
    price: 19.99,
    coverImage: "https://image.api.playstation.com/vulcan/img/rnd/202010/2614/J5v8I9X6W5W8X9Z6W5.png",
    categories: ["Action", "RPG", "Horror"]
  },
  {
    title: "Final Fantasy VII Remake Intergrade",
    description: "Cloud Strife, an ex-SOLDIER operative, descends on the mako-powered city of Midgar. The world of the timeless classic FINAL FANTASY VII is reborn.",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1462040/header.jpg",
    categories: ["RPG", "Action", "Fantasy"]
  },
  {
    title: "Persona 5 Royal",
    description: "Don the mask and join the Phantom Thieves of Hearts as they stage grand heists, infiltrate the minds of the corrupt, and make them change their ways!",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg",
    categories: ["RPG", "Anime", "Strategy"]
  },
  {
    title: "NieR:Automata™",
    description: "NieR: Automata tells the story of androids 2B, 9S and A2 and their battle to reclaim the machine-driven dystopia overrun by powerful machines.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/524220/header.jpg",
    categories: ["Action", "RPG", "Sci-Fi"]
  },
  {
    title: "Yakuza: Like a Dragon",
    description: "Become Ichiban Kasuga, a low-ranking yakuza grunt left on the brink of death by the man he trusted most. Take up your legendary bat and get ready to crack some underworld skulls in dynamic RPG combat set against the backdrop of modern-day Japan.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1235140/header.jpg",
    categories: ["RPG", "Action", "Adventure"]
  },
  {
    title: "Control Ultimate Edition",
    description: "Winner of over 80 awards, Control is a visually stunning third-person action-adventure that will keep you on the edge of your seat.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/870780/header.jpg",
    categories: ["Action", "Adventure", "Sci-Fi"]
  },
  {
    title: "Alan Wake 2",
    description: "A string of ritualistic murders threatens Bright Falls, a small-town community surrounded by pacific northwest wilderness. Saga Anderson, an accomplished FBI agent with a reputation for solving impossible cases arrives to investigate the murders.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/108710/header.jpg",
    categories: ["Horror", "Adventure", "Mystery"]
  },
  {
    title: "Death Stranding Director's Cut",
    description: "From legendary game creator Hideo Kojima comes a genre-defying experience, now expanded and remastered for PC in this definitive DIRECTOR’S CUT.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg",
    categories: ["Action", "Adventure", "Sci-Fi"]
  },
  {
    title: "Ghost of Tsushima DIRECTOR'S CUT",
    description: "A storm is coming. Venture into the open world of Tsushima in this action-adventure game. You are Jin Sakai, one of the last samurai survivors of your clan.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2215430/header.jpg",
    categories: ["Action", "Adventure", "Open World"]
  },
  {
    title: "Horizon Forbidden West™ Complete Edition",
    description: "Experience the epic Horizon Forbidden West™ in its entirety with bonus content and the Burning Shores expansion included.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2420110/header.jpg",
    categories: ["Action", "Adventure", "Open World"]
  },
  {
    title: "Marvel’s Spider-Man Remastered",
    description: "Developed by Insomniac Games in collaboration with Marvel, and optimized for PC by Nixxes Software, Marvel's Spider-Man Remastered introduces an experienced Peter Parker who is fighting big crime and iconic villains in Marvel’s New York.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg",
    categories: ["Action", "Adventure", "Open World"]
  },
  {
    title: "Marvel’s Spider-Man: Miles Morales",
    description: "Teenager Miles Morales is adjusting to his new home while following in the footsteps of his mentor, Peter Parker, as a new Spider-Man.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1817190/header.jpg",
    categories: ["Action", "Adventure", "Open World"]
  },
  {
    title: "Ratchet & Clank: Rift Apart",
    description: "Blast your way through an interdimensional adventure. Ratchet and Clank are back! Help them stop a robotic emperor intent on conquering cross-dimensional worlds, with their own universe next in the firing line.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1895880/header.jpg",
    categories: ["Action", "Adventure", "Platformer"]
  },
  {
    title: "Returnal™",
    description: "Break the cycle as this award-winning third-person shooter brings bullet hell action to PC. Selene’s roguelike odyssey arrives with a suite of arresting graphical and performance-based enhancements to ensure an unforgettable journey.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1649240/header.jpg",
    categories: ["Action", "Shooter", "Sci-Fi"]
  },
  {
    title: "The Last of Us™ Part I",
    description: "Experience the emotional storytelling and unforgettable characters in The Last of Us™, winner of over 200 Game of the Year awards.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg",
    categories: ["Action", "Adventure", "Horror"]
  },
  {
    title: "Uncharted™: Legacy of Thieves Collection",
    description: "Seek your legacy and leave your mark on the map in UNCHARTED: Legacy of Thieves Collection. Experience Naughty Dog’s thrilling, cinematic storytelling and the iconic franchise’s largest blockbuster action set pieces.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1659420/header.jpg",
    categories: ["Action", "Adventure"]
  },
  {
    title: "Detroit: Become Human",
    description: "Detroit: Become Human puts the destiny of both mankind and androids in your hands, taking you to a near future where machines have become more intelligent than humans. Every choice you make affects the outcome of the game, with one of the most intricately branching narratives ever created.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1222140/header.jpg",
    categories: ["Adventure", "Sci-Fi", "Story Rich"]
  },
  {
    title: "Heavy Rain",
    description: "Experience a gripping psychological thriller filled with innumerable twists and turns. The hunt is on for a murderer known only as the Origami Killer. Four characters, each following their own leads, must take part in a desperate attempt to prevent the killer from claiming a new victim.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/960910/header.jpg",
    categories: ["Adventure", "Story Rich", "Mystery"]
  },
  {
    title: "Beyond: Two Souls",
    description: "A unique psychological action thriller delivered by A-list Hollywood performances of Ellen Page and Willem Dafoe, Beyond: Two Souls™ takes you on a thrilling journey across the globe as you play out the remarkable life of Jodie Holmes.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/960990/header.jpg",
    categories: ["Adventure", "Story Rich", "Sci-Fi"]
  },
  {
    title: "Mass Effect™ Legendary Edition",
    description: "The Mass Effect™ Legendary Edition includes single-player base content and over 40 DLC from Mass Effect, Mass Effect 2, and Mass Effect 3 games, including promo weapons, armors and packs — remastered and optimized for 4K Ultra HD.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1328670/header.jpg",
    categories: ["RPG", "Sci-Fi", "Shooter"]
  },
  {
    title: "Dragon Age™: Inquisition",
    description: "When the sky opens up and rains down chaos, the world needs heroes. Become the savior of Thedas in Dragon Age: Inquisition. You are the Inquisitor, tasked with saving the world from itself.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1222690/header.jpg",
    categories: ["RPG", "Fantasy", "Action"]
  },
  {
    title: "Star Wars Jedi: Survivor™",
    description: "The story of Cal Kestis continues in Star Wars Jedi: Survivor™, a third-person galaxy-spanning action-adventure game from Respawn Entertainment, developed in collaboration with Lucasfilm Games.",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1774580/header.jpg",
    categories: ["Action", "Adventure", "Sci-Fi"]
  },
  {
    title: "Star Wars Jedi: Fallen Order™",
    description: "A galaxy-spanning adventure awaits in Star Wars Jedi: Fallen Order, a new third-person action-adventure title from Respawn Entertainment. This narratively driven single-player game puts you in the role of a Jedi Padawan who narrowly escaped the purge of Order 66 following the events of Episode 3: Revenge of the Sith.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1172380/header.jpg",
    categories: ["Action", "Adventure", "Sci-Fi"]
  },
  {
    title: "Dead Space",
    description: "The sci-fi survival horror classic returns, completely rebuilt to offer an even more immersive experience — including visual, audio, and gameplay improvements while staying faithful to the original game’s thrilling vision.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1693980/header.jpg",
    categories: ["Horror", "Action", "Sci-Fi"]
  },
  {
    title: "Bioshock Infinite",
    description: "Indebted to the wrong people, with his life on the line, veteran of the U.S. Cavalry and now hired gun, Booker DeWitt has only one opportunity to wipe his slate clean. He must rescue Elizabeth, a mysterious girl imprisoned since childhood and locked up in the flying city of Columbia.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/8870/header.jpg",
    categories: ["Action", "Shooter", "Story Rich"]
  },
  {
    title: "Borderlands 3",
    description: "The original shooter-looter returns, packing bazillions of guns and a mayhem-fueled adventure! Blast through new worlds and enemies as one of four new Vault Hunters.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/397540/header.jpg",
    categories: ["Action", "Shooter", "RPG"]
  },
  {
    title: "Tiny Tina's Wonderlands",
    description: "Embark on an epic adventure full of whimsy, wonder, and high-powered weaponry! Bullets, magic, and broadswords collide across this chaotic fantasy world brought to life by the unpredictable Tiny Tina.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1286680/header.jpg",
    categories: ["Action", "Shooter", "RPG"]
  },
  {
    title: "Sid Meier’s Civilization® V",
    description: "The Flagship Turn-Based Strategy Game Returns. Become Ruler of the World by establishing and leading a civilization from the dawn of man into the space age: Wage war, conduct diplomacy, discover new technologies, go head-to-head with some of history’s greatest leaders and build the most powerful empire the world has ever known.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/8930/header.jpg",
    categories: ["Strategy", "Simulation"]
  },
  {
    title: "XCOM® 2",
    description: "XCOM 2 is the sequel to XCOM: Enemy Unknown, the 2012 award-winning strategy game of the year. Earth has changed. Twenty years have passed since world leaders offered an unconditional surrender to alien forces. XCOM, the planet’s last line of defense, is decimated and scattered.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/268500/header.jpg",
    categories: ["Strategy", "Sci-Fi", "Action"]
  },
  {
    title: "Divinity: Original Sin 2 - Definitive Edition",
    description: "The critically acclaimed RPG that raised the bar, from the creators of Baldur's Gate 3. Gather your party. Master deep, tactical combat. Venture as a party of up to four - but know that only one of you will have the chance to become a God.",
    price: 44.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/435150/header.jpg",
    categories: ["RPG", "Strategy", "Fantasy"]
  },
  {
    title: "Disco Elysium - The Final Cut",
    description: "Disco Elysium - The Final Cut is a groundbreaking role playing game. You’re a detective with a unique skill system at your disposal and a whole city to carve your path across. Interrogate unforgettable characters, crack murders or take bribes. Become a hero or an absolute disaster of a human being.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg",
    categories: ["RPG", "Indie", "Story Rich"]
  },
  {
    title: "Outer Wilds",
    description: "Winner of Best Game at the 2020 BAFTA Games Awards and named Game of the Year by Giant Bomb, Polygon, Eurogamer, and The Guardian, Outer Wilds is a critically-acclaimed and award-winning open world mystery about a solar system trapped in an endless time loop.",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg",
    categories: ["Adventure", "Indie", "Space"]
  },
  {
    title: "Tunic",
    description: "Explore a land filled with lost legends, ancient powers, and ferocious monsters in TUNIC, an isometric action game about a small fox on a big adventure.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/553420/header.jpg",
    categories: ["Action", "Indie", "Adventure"]
  },
  {
    title: "Stray",
    description: "Lost, alone and separated from family, a stray cat must untangle an ancient mystery to escape a long-forgotten cybercity and find their way home.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1332010/header.jpg",
    categories: ["Adventure", "Indie", "Sci-Fi"]
  },
  {
    title: "Cult of the Lamb",
    description: "Start your own cult in a land of false prophets, venturing out into diverse and mysterious regions to build a loyal community of woodland worshippers and spread your Word to become the one true cult.",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1313140/header.jpg",
    categories: ["Action", "Indie", "Strategy"]
  },
  {
    title: "Dave the Diver",
    description: "DAVE THE DIVER is a casual, singleplayer adventure RPG featuring deep-sea exploration and fishing during the day and sushi restaurant management at night. Join Dave and his quirky friends as they seek to uncover the secrets of the mysterious Blue Hole.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1868140/header.jpg",
    categories: ["Adventure", "Indie", "Simulation"]
  },
  {
    title: "Dredge",
    description: "Dredge is a single-player fishing adventure with a sinister undercurrent. Sell your catch, upgrade your boat, and dredge the depths for long-buried secrets. Explore a mysterious archipelago and discover why some things are best left forgotten.",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1562430/header.jpg",
    categories: ["Adventure", "Indie", "Horror"]
  },
  {
    title: "Inscryption",
    description: "Inscryption is an inky black card-based odyssey that blends the deckbuilding roguelike, escape-room style puzzles, and psychological horror into a blood-laced smoothie. Darker still are the secrets inscrybed upon the cards...",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1092790/header.jpg",
    categories: ["Strategy", "Indie", "Horror"]
  },
  {
    title: "Balatro",
    description: "Balatro is a poker-inspired roguelike deck builder all about creating powerful synergies and winning big.",
    price: 14.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2379780/header.jpg",
    categories: ["Strategy", "Indie", "Roguelike"]
  },
  {
    title: "Manor Lords",
    description: "Manor Lords is a medieval strategy game featuring in-depth city building, large-scale tactical battles, and complex economic and social simulations. Rule your lands as a medieval lord -- the seasons pass, the weather changes, and cities rise and fall.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1363080/header.jpg",
    categories: ["Strategy", "Simulation", "Indie"]
  },
  {
    title: "Content Warning",
    description: "Film your friends doing scary things to become SpookTube famous!",
    price: 7.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2881650/header.jpg",
    categories: ["Horror", "Indie", "Co-op"]
  },
  {
    title: "Kenshi",
    description: "A free-roaming squad based RPG. Focusing on open-ended sandbox gameplay features rather than a linear story. Be a trader, a thief, a rebel, a warlord, an adventurer, a farmer, a slave, or just food for the cannibals.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/233860/header.jpg",
    categories: ["RPG", "Open World", "Indie"]
  },
  {
    title: "Mount & Blade II: Bannerlord",
    description: "A strategy/action RPG. Create a character, engage in diplomacy, craft, trade and conquer new lands in a vast medieval sandbox. Raise armies to lead into battle and command and fight alongside your troops in massive real-time battles using a deep but intuitive skill-based combat system.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/261550/header.jpg",
    categories: ["Strategy", "RPG", "Action"]
  },
  {
    title: "Kingdom Come: Deliverance",
    description: "Story-driven open-world RPG that immerses you in an epic adventure in the Holy Roman Empire. Avenge your parents' death as you battle invading forces, go on game-changing quests, and make influential choices.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/379430/header.jpg",
    categories: ["RPG", "Open World", "Action"]
  },
  {
    title: "Medieval Dynasty",
    description: "Hunt, survive, build and lead in the harsh Middle Ages: Create your own Medieval Dynasty and ensure its long-lasting prosperity or die trying!",
    price: 34.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1129580/header.jpg",
    categories: ["Simulation", "RPG", "Survival"]
  },
  {
    title: "Green Hell",
    description: "Green Hell is a sweltering struggle for survival in the Amazonian rainforest. Clinging to life, the player is set on a journey of durability as the effects of solitude wear heavy not only on the body but also the mind.",
    price: 24.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/815370/header.jpg",
    categories: ["Survival", "Simulation", "Indie"]
  },
  {
    title: "The Forest",
    description: "As the lone survivor of a passenger jet crash, you find yourself in a mysterious forest battling to stay alive against a society of cannibalistic mutants. Build, explore, survive in this terrifying first person survival horror simulator.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg",
    categories: ["Survival", "Horror", "Action"]
  },
  {
    title: "Raft",
    description: "Raft throws you and your friends into an epic oceanic adventure! Alone or together, players battle to survive a perilous voyage across a vast sea! Gather debris, scavenge reefs and build your own floating home, but be wary of the man-eating sharks!",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/648800/header.jpg",
    categories: ["Survival", "Adventure", "Indie"]
  },
  {
    title: "Grounded",
    description: "The world is a vast, beautiful and dangerous place – especially when you have been shrunk to the size of an ant. Explore, build and survive together in this first person, multiplayer, survival-adventure. Can you thrive alongside the hordes of giant insects, fighting to survive the perils of the backyard?",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/962130/header.jpg",
    categories: ["Survival", "Adventure", "Action"]
  },
  {
    title: "Satisfactory",
    description: "Satisfactory is a first-person open-world factory building game with a dash of exploration and combat. Play alone or with friends, explore an alien planet, create multi-story factories, and enter conveyor belt heaven!",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/526870/header.jpg",
    categories: ["Simulation", "Strategy", "Open World"]
  },
  {
    title: "Deep Rock Galactic",
    description: "Deep Rock Galactic is a 1-4 player co-op FPS featuring badass space Dwarves, 100% destructible environments, procedurally-generated caves, and endless hordes of alien monsters.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/548430/header.jpg",
    categories: ["Action", "Shooter", "Co-op"]
  },
  {
    title: "Payday 2",
    description: "PAYDAY 2 is an action-packed, four-player co-op shooter that once again lets gamers don the masks of the original PAYDAY crew - Dallas, Hoxton, Wolf and Chains - as they descend on Washington DC for an epic crime spree.",
    price: 9.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/218620/header.jpg",
    categories: ["Action", "Shooter", "Co-op"]
  },
  {
    title: "Payday 3",
    description: "PAYDAY 3 is the explosive sequel to one of the most popular co-op shooters of the past decade. Since its release, PAYDAY-players have been reveling in the thrill of a perfectly planned and executed heist. That’s what makes PAYDAY a high-octane co-op FPS experience without equal.",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1272080/header.jpg",
    categories: ["Action", "Shooter", "Co-op"]
  },
  {
    title: "Tom Clancy's Ghost Recon® Wildlands",
    description: "Create a team with up to 3 friends in Tom Clancy’s Ghost Recon® Wildlands and enjoy the ultimate military shooter experience set in a massive, dangerous, and responsive open world.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/460930/header.jpg",
    categories: ["Action", "Shooter", "Open World"]
  },
  {
    title: "Tom Clancy’s The Division® 2",
    description: "In Tom Clancy’s The Division® 2, the fate of the free world is on the line. Lead a team of elite agents into a post-pandemic Washington DC to restore order and prevent the collapse of the city.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2221490/header.jpg",
    categories: ["Action", "Shooter", "RPG"]
  },
  {
    title: "Watch Dogs® 2",
    description: "Welcome to San Francisco. Play as Marcus, a brilliant young hacker, and join the most notorious hacker group, DedSec. Your objective: execute the biggest hack of history.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/447040/header.jpg",
    categories: ["Action", "Open World", "Adventure"]
  },
  {
    title: "Far Cry® 5",
    description: "Welcome to Hope County, Montana, home to a fanatical doomsday cult known as The Project at Eden’s Gate. Stand up to cult leader Joseph Seed and his siblings, the Heralds, to spark the fires of resistance and liberate the besieged community.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/552520/header.jpg",
    categories: ["Action", "Open World", "Shooter"]
  },
  {
    title: "Far Cry® 6",
    description: "Welcome to Yara, a tropical paradise frozen in time. As the dictator of Yara, Antón Castillo is intent on restoring his nation back to its former glory by any means, with his son, Diego, following in his bloody footsteps. Their oppressive rule has ignited a revolution.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2369390/header.jpg",
    categories: ["Action", "Open World", "Shooter"]
  },
  {
    title: "Assassin's Creed® Odyssey",
    description: "Choose your fate in Assassin's Creed® Odyssey. From outcast to living legend, embark on an odyssey to uncover the secrets of your past and change the fate of Ancient Greece.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/812140/header.jpg",
    categories: ["Action", "RPG", "Open World"]
  },
  {
    title: "Assassin's Creed® Valhalla",
    description: "Become Eivor, a legendary Viking raider. Explore England's Dark Ages as you raid your enemies, grow your settlement, and build your political power in the quest to earn a place among the gods in Valhalla.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2208920/header.jpg",
    categories: ["Action", "RPG", "Open World"]
  },
  {
    title: "Assassin's Creed® Origins",
    description: "ASSASSIN’S CREED® ORIGINS IS A NEW BEGINNING * The Discovery Tour by Assassin’s Creed®: Ancient Egypt is now available as a free update! * Ancient Egypt, a land of majesty and intrigue, is disappearing in a ruthless fight for power.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/582160/header.jpg",
    categories: ["Action", "RPG", "Open World"]
  },
  {
    title: "Sniper Elite 5",
    description: "The award-winning series returns as Karl Fairburne fights to uncover Project Kraken in 1944 France. The genre-defining authentic sniping, with enhanced kill cam, has never looked or felt better as you fight across immersive maps to stop the Nazi war machine in its tracks.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1029690/header.jpg",
    categories: ["Action", "Shooter", "Strategy"]
  },
  {
    title: "Hitman World of Assassination",
    description: "Enter the world of the ultimate assassin. HITMAN World of Assassination brings together the best of HITMAN, HITMAN 2 and HITMAN 3 including the main campaign, contracts mode, escalations, elusive target arcades and featured live content.",
    price: 69.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1659040/header.jpg",
    categories: ["Action", "Stealth", "Strategy"]
  },
  {
    title: "Metal Gear Solid V: The Phantom Pain",
    description: "Ushering in a new era for the franchise with cutting-edge technology powered by the Fox Engine, MGSV: The Phantom Pain will provide players a first-rate gaming experience as they are offered tactical freedom to carry out open-world missions.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/287700/header.jpg",
    categories: ["Action", "Stealth", "Open World"]
  },
  {
    title: "Deathloop",
    description: "DEATHLOOP is a next-gen FPS from Arkane Lyon, the award-winning studio behind Dishonored. In DEATHLOOP, two rival assassins are trapped in a mysterious timeloop on the island of Blackreef, doomed to repeat the same day for eternity.",
    price: 59.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1252330/header.jpg",
    categories: ["Action", "Shooter", "Sci-Fi"]
  },
  {
    title: "Dishonored 2",
    description: "Reprise your role as a supernatural assassin in Dishonored 2. Praised by PC Gamer as 'brilliant', IGN as 'amazing' and 'a superb sequel', declared a 'masterpiece' by Eurogamer, and hailed 'a must-play revenge tale' by Game Informer, Dishonored 2 is the follow up to Arkane Studio's first-person action blockbuster & winner of 100+ 'Game of the Year' awards, Dishonored.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/403640/header.jpg",
    categories: ["Action", "Stealth", "Fantasy"]
  },
  {
    title: "Prey",
    description: "In Prey, you awaken aboard Talos I, a space station orbiting the moon in the year 2032. You are the key subject of an experiment meant to alter humanity forever – but things have gone terribly wrong.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/480490/header.jpg",
    categories: ["Action", "Sci-Fi", "Shooter"]
  },
  {
    title: "Batman™: Arkham Knight",
    description: "Batman™: Arkham Knight brings the award-winning Arkham trilogy from Rocksteady Studios to its epic conclusion. Developed exclusively for New-Gen platforms, Batman: Arkham Knight introduces Rocksteady's uniquely designed version of the Batmobile.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/208650/header.jpg",
    categories: ["Action", "Adventure", "Open World"]
  },
  {
    title: "Middle-earth™: Shadow of War™",
    description: "Experience an epic open-world brought to life by the award-winning Nemesis System. Forge a new Ring of Power, conquer Fortresses in massive battles and dominate Mordor with your personal orc army in Middle-earth™: Shadow of War™.",
    price: 49.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/356190/header.jpg",
    categories: ["Action", "RPG", "Open World"]
  },
  {
    title: "Mad Max",
    description: "Become Mad Max, the lone warrior in a savage post-apocalyptic world where cars are the key to survival. In this open world, third person action game, you must fight to stay alive in The Wasteland, using brutal on-ground and vehicular against vicious gangs of bandits.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/234140/header.jpg",
    categories: ["Action", "Open World", "Adventure"]
  },
  {
    title: "Just Cause 3",
    description: "The Mediterranean republic of Medici is suffering under the brutal control of General Di Ravello, a dictator with an insatiable appetite for power. Enter Rico Rodriguez, a man on a mission to destroy the General’s hold on power by any means necessary.",
    price: 19.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/225540/header.jpg",
    categories: ["Action", "Open World", "Adventure"]
  },
  {
    title: "Just Cause 4 Reloaded",
    description: "Rogue agent Rico Rodriguez journeys to Solis, a huge South American world home of conflict, oppression and extreme weather conditions. Strap into your wingsuit, equip your fully customizable grappling hook, and get ready to bring the thunder!",
    price: 39.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/517630/header.jpg",
    categories: ["Action", "Open World", "Adventure"]
  },
  {
    title: "Saints Row",
    description: "Welcome to Santo Ileso, a vibrant fictional city in the American Southwest. In a world rife with crime, where lawless factions fight for power, a group of young friends embark on their own criminal venture, as they rise to the top in their bid to become Self Made.",
    price: 29.99,
    coverImage: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/742420/header.jpg",
    categories: ["Action", "Open World", "Adventure"]
  }
];

async function main() {
  console.log('Start seeding...');

  // Create Users
  console.log('Creating users...');
  const users = [
    { email: 'admin@gamestore.com', password: 'password123', name: 'Admin User', role: 'ADMIN' },
    { email: 'publisher@gamestore.com', password: 'password123', name: 'Publisher User', role: 'PUBLISHER' },
    { email: 'user@gamestore.com', password: 'password123', name: 'Standard User', role: 'USER' }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role // Ensure role is correct even if user exists
      },
      create: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
        walletBalance: 1000.00
      }
    });
  }

  // Create categories
  console.log('Creating categories...');
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create games
  console.log('Creating games...');
  for (const game of gamesData) {
    const { categories: gameCategories, coverImage, videoUrl, ...gameData } = game;
    
    // Check if game exists
    const existingGame = await prisma.game.findFirst({
      where: { title: game.title }
    });

    let createdGame;

    if (existingGame) {
      console.log(`Updating ${game.title}...`);
      createdGame = await prisma.game.update({
        where: { id: existingGame.id },
        data: {
          ...gameData,
          imageUrl: coverImage,
          videoUrl: videoUrl,
          categories: {
            set: [], // Clear existing connections
            connect: gameCategories.map(c => ({ name: c }))
          }
        }
      });
    } else {
      console.log(`Creating ${game.title}...`);
      createdGame = await prisma.game.create({
        data: {
          ...gameData,
          imageUrl: coverImage,
          videoUrl: videoUrl,
          categories: {
            connect: gameCategories.map(c => ({ name: c }))
          }
        }
      });
    }

    // Add cover image if provided
    if (coverImage) {
      // Check if image exists to avoid duplicates (optional but good)
      const existingImage = await prisma.gameImage.findFirst({
        where: { gameId: createdGame.id, url: coverImage }
      });

      if (!existingImage) {
        await prisma.gameImage.create({
          data: {
            url: coverImage,
            gameId: createdGame.id
          }
        });
        
        // Add a second random screenshot for variety (simulated)
        await prisma.gameImage.create({
          data: {
            url: coverImage, // Using same image for demo
            gameId: createdGame.id
          }
        });
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
