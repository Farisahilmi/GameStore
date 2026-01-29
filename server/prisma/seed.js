const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Start seeding ...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gamestore.com' },
    update: {},
    create: { email: 'admin@gamestore.com', password: passwordHash, name: 'Admin User', role: 'ADMIN' },
  });

  const publisherRockstar = await prisma.user.upsert({
    where: { email: 'publisher@rockstar.com' },
    update: {},
    create: { email: 'publisher@rockstar.com', password: passwordHash, name: 'Rockstar Games', role: 'PUBLISHER' },
  });
  
  const publisherCDPR = await prisma.user.upsert({
    where: { email: 'publisher@cdpr.com' },
    update: {},
    create: { email: 'publisher@cdpr.com', password: passwordHash, name: 'CD Projekt Red', role: 'PUBLISHER' },
  });

  const publisherIndie = await prisma.user.upsert({
    where: { email: 'publisher@indie.com' },
    update: {},
    create: { email: 'publisher@indie.com', password: passwordHash, name: 'Indie Dev', role: 'PUBLISHER' },
  });

  const publisherSony = await prisma.user.upsert({
    where: { email: 'publisher@sony.com' },
    update: {},
    create: { email: 'publisher@sony.com', password: passwordHash, name: 'PlayStation PC', role: 'PUBLISHER' },
  });

  // 2. Create Categories
  const categories = ['Action', 'RPG', 'Adventure', 'Strategy', 'Shooter', 'Open World', 'Indie', 'Simulation', 'Sports', 'Horror'];
  
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    });
  }

  // 3. Create Games (Using Steam CDN for reliable images)
  const gamesData = [
    // Rockstar
    {
      title: 'Grand Theft Auto V',
      description: 'The biggest, most dynamic and most diverse open world ever created.',
      price: 29.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Open World', 'Shooter']
    },
    {
      title: 'Red Dead Redemption 2',
      description: 'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Open World', 'Adventure']
    },
    // CDPR
    {
      title: 'Cyberpunk 2077',
      description: 'Cyberpunk 2077 is an open-world, action-adventure story set in Night City.',
      price: 49.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
      publisherId: publisherCDPR.id,
      categories: ['RPG', 'Open World', 'Shooter']
    },
    {
      title: 'The Witcher 3: Wild Hunt',
      description: 'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent.',
      price: 39.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg',
      publisherId: publisherCDPR.id,
      categories: ['RPG', 'Open World', 'Adventure']
    },
    // Sony / Others
    {
      title: 'Elden Ring',
      description: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
      publisherId: publisherSony.id,
      categories: ['RPG', 'Action', 'Open World']
    },
    {
      title: 'God of War',
      description: 'His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters.',
      price: 49.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'Adventure']
    },
    {
      title: 'Horizon Zero Dawn',
      description: 'Experience Aloy\'s legendary quest to unravel the mysteries of a future Earth ruled by Machines.',
      price: 49.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'Adventure', 'Open World']
    },
    {
      title: 'Marvel\'s Spider-Man Remastered',
      description: 'Play as an experienced Peter Parker, fighting big crime and iconic villains in Marvel’s New York.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'Adventure']
    },
    // Indie / Misc
    {
      title: 'Hades',
      description: 'Defy the god of the dead as you hack and slash out of the Underworld.',
      price: 24.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'RPG', 'Indie']
    },
    {
      title: 'Stardew Valley',
      description: 'You have inherited your grandfather\'s old farm plot in Stardew Valley.',
      price: 14.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['RPG', 'Strategy', 'Indie', 'Simulation']
    },
    {
      title: 'Terraria',
      description: 'Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game.',
      price: 9.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'Adventure', 'RPG']
    },
    {
      title: 'Hollow Knight',
      description: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.',
      price: 14.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'Action', 'Adventure']
    },
    {
      title: 'Among Us',
      description: 'An online and local party game of teamwork and betrayal for 4-15 players.',
      price: 4.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'Strategy']
    },
    {
      title: 'Left 4 Dead 2',
      description: 'Set in the zombie apocalypse, Left 4 Dead 2 (L4D2) is the highly anticipated sequel to the award-winning Left 4 Dead.',
      price: 9.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/550/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Shooter', 'Horror']
    },
    {
      title: 'Resident Evil 4',
      description: 'Survival is just the beginning. Six years have passed since the biological disaster in Raccoon City.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'Horror', 'Adventure']
    },
    {
      title: 'Baldur\'s Gate 3',
      description: 'Baldur’s Gate 3 is a story-rich, party-based RPG set in the universe of Dungeons & Dragons.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['RPG', 'Strategy', 'Adventure']
    },
    {
      title: 'FIFA 23',
      description: 'EA SPORTS™ FIFA 23 brings The World’s Game to the pitch, with HyperMotion2 Technology.',
      price: 69.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1811260/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Sports', 'Simulation']
    },
    {
      title: 'Forza Horizon 5',
      description: 'Your Ultimate Horizon Adventure awaits! Explore the vibrant and ever-evolving open world landscapes of Mexico.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Sports', 'Open World']
    },
    {
      title: 'Minecraft',
      description: 'Prepare for an adventure of limitless possibilities as you build, mine, battle mobs, and explore the ever-changing Minecraft landscape.',
      price: 29.99,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'Simulation', 'Adventure']
    },
    {
      title: 'The Last of Us Part I',
      description: 'Experience the emotional storytelling and unforgettable characters in The Last of Us, winner of over 200 Game of the Year awards.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'Adventure', 'Horror']
    },
    // --- Additional Games ---
    {
      title: 'Dying Light 2 Stay Human',
      description: 'The virus won and civilization has fallen back to the Dark Ages. The City, one of the last human settlements, is on the brink of collapse.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/534380/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'RPG', 'Horror']
    },
    {
      title: 'Sekiro: Shadows Die Twice',
      description: 'Explore late 1500s Sengoku Japan, a brutal period of constant life and death conflict, as you come face to face with larger than life foes.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'Adventure']
    },
    {
      title: 'Outer Wilds',
      description: 'Outer Wilds is an open world mystery about a solar system trapped in an endless time loop.',
      price: 24.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/753640/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Adventure', 'Indie']
    },
    {
      title: 'Dead Cells',
      description: 'Dead Cells is a rogue-lite, metroidvania inspired, action-platformer.',
      price: 24.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/588650/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'Indie', 'RPG']
    },
    {
      title: 'Disco Elysium - The Final Cut',
      description: 'Disco Elysium - The Final Cut is a groundbreaking role playing game.',
      price: 39.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['RPG', 'Indie']
    },
    {
      title: 'Subnautica',
      description: 'Descend into the depths of an alien underwater world filled with wonder and peril.',
      price: 29.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Adventure', 'Indie', 'Simulation']
    },
    {
      title: 'Valheim',
      description: 'A brutal exploration and survival game for 1-10 players, set in a procedurally-generated world inspired by Norse mythology.',
      price: 19.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/892970/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'RPG', 'Adventure']
    },
    {
      title: 'Deep Rock Galactic',
      description: 'Deep Rock Galactic is a 1-4 player co-op FPS featuring badass space Dwarves, 100% destructible environments, procedurally-generated caves, and endless hordes of alien monsters.',
      price: 29.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/548430/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'Shooter', 'Indie']
    },
    {
      title: 'Phasmophobia',
      description: 'Phasmophobia is a 4 player online co-op psychological horror.',
      price: 13.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/739630/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Horror', 'Indie']
    },
    {
      title: 'Sea of Thieves',
      description: 'Sea of Thieves offers the essential pirate experience, from sailing and fighting to exploring and looting.',
      price: 39.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172620/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'Adventure']
    },
    {
      title: 'Slay the Spire',
      description: 'We fused card games and roguelikes together to make the best single player deckbuilder we could.',
      price: 24.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/646570/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'Strategy', 'RPG']
    },
    {
      title: 'Rust',
      description: 'The only aim in Rust is to survive. To do this you will need to overcome struggles such as hunger, thirst and cold.',
      price: 39.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'Indie', 'Simulation']
    },
    {
      title: 'RimWorld',
      description: 'A sci-fi colony sim driven by an intelligent AI storyteller.',
      price: 34.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/294100/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'Simulation', 'Strategy']
    },
    {
      title: 'Factorio',
      description: 'Factorio is a game about building and creating automated factories to produce items of increasing complexity.',
      price: 30.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/427520/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'Simulation', 'Strategy']
    },
    {
      title: 'Project Zomboid',
      description: 'Project Zomboid is the ultimate in zombie survival. Alone or in MP: you loot, build, craft, fight, farm and fish in a struggle to survive.',
      price: 19.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'RPG', 'Simulation', 'Horror']
    },
    {
      title: 'Cuphead',
      description: 'Cuphead is a classic run and gun action game heavily focused on boss battles.',
      price: 19.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268910/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'Indie']
    },
    {
      title: 'Portal 2',
      description: 'The Perpetual Testing Initiative has been expanded to allow you to design co-op puzzles for you and your friends!',
      price: 9.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Adventure']
    },
    {
      title: 'Dota 2',
      description: 'Every day, millions of players worldwide enter battle as one of over a hundred Dota heroes.',
      price: 0.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Strategy']
    },
    {
      title: 'Counter-Strike: Global Offensive',
      description: 'Counter-Strike: Global Offensive (CS: GO) expands upon the team-based action gameplay that it pioneered when it was launched 19 years ago.',
      price: 0.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Shooter']
    },
    {
      title: 'Apex Legends',
      description: 'Conquer with character in Apex Legends, a free-to-play Hero Shooter where legendary characters with powerful abilities team up to battle for fortune & fame on the fringes of the Frontier.',
      price: 0.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'Shooter']
    },
    {
      title: 'Destiny 2',
      description: 'Destiny 2 is an action MMO with a single evolving world that you and your friends can join anytime, anywhere, for free.',
      price: 0.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1085660/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'RPG', 'Shooter']
    },
    {
      title: 'Warframe',
      description: 'Warframe is a cooperative free-to-play third person online action game set in an evolving sci-fi world.',
      price: 0.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/230410/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'RPG', 'Shooter']
    },
    {
      title: 'Team Fortress 2',
      description: 'Nine distinct classes provide a broad range of tactical abilities and personalities.',
      price: 0.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/440/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Shooter']
    },
    {
      title: 'Path of Exile',
      description: 'You are an Exile, struggling to survive on the dark continent of Wraeclast, as you fight to earn power that will allow you to take your revenge against those who wronged you.',
      price: 0.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/238960/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['RPG', 'Action', 'Indie']
    },
    {
      title: 'Lost Ark',
      description: 'Embark on an odyssey for the Lost Ark in a vast, vibrant world: explore new lands, seek out lost treasures, and test yourself in thrilling action combat.',
      price: 0.00,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1599340/header.jpg',
      publisherId: publisherSony.id,
      categories: ['RPG', 'Action']
    },
    {
      title: 'Monster Hunter: World',
      description: 'Welcome to a new world! Take on the role of a hunter and slay ferocious monsters in a living, breathing ecosystem.',
      price: 29.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Action', 'RPG']
    },
    {
      title: 'The Forest',
      description: 'As the lone survivor of a passenger jet crash, you find yourself in a mysterious forest battling a society of genetic mutant cannibals.',
      price: 19.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'Adventure', 'Indie', 'Simulation', 'Horror']
    },
    {
      title: 'Raft',
      description: 'By yourself or with friends, your mission is to survive an epic oceanic adventure across a perilous sea!',
      price: 19.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Adventure', 'Indie', 'Simulation']
    },
    {
      title: '7 Days to Die',
      description: '7 Days to Die is an open-world game that is a unique combination of first person shooter, survival horror, tower defense, and role-playing games.',
      price: 24.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/251570/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Action', 'Adventure', 'Indie', 'RPG', 'Simulation', 'Horror']
    },
    {
      title: 'Euro Truck Simulator 2',
      description: 'Travel across Europe as king of the road, a trucker who delivers important cargo across impressive distances!',
      price: 19.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/227300/header.jpg',
      publisherId: publisherIndie.id,
      categories: ['Indie', 'Simulation']
    },
    {
      title: 'Cities: Skylines',
      description: 'Cities: Skylines is a modern take on the classic city simulation.',
      price: 29.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/255710/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Simulation', 'Strategy']
    },
    {
      title: 'Hearts of Iron IV',
      description: 'Victory is at your fingertips! Your ability to lead your nation is your supreme weapon.',
      price: 39.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/394360/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Simulation', 'Strategy']
    },
    {
      title: 'Stellaris',
      description: 'Explore a vast galaxy full of wonder! Paradox Development Studio, makers of the Crusader Kings and Europa Universalis series presents Stellaris, an evolution of the grand strategy genre with space exploration at its core.',
      price: 39.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/281990/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Simulation', 'Strategy']
    },
    {
      title: 'Civilization VI',
      description: 'Civilization VI offers new ways to interact with your world, expand your empire across the map, advance your culture, and compete against history’s greatest leaders to build a civilization that will stand the test of time.',
      price: 59.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/289070/header.jpg',
      publisherId: publisherSony.id,
      categories: ['Strategy', 'Simulation']
    },
    {
      title: 'Garry\'s Mod',
      description: 'Garry\'s Mod is a physics sandbox. There aren\'t any predefined aims or goals. We give you the tools and leave you to play.',
      price: 9.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4000/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Adventure', 'Indie', 'Simulation']
    },
    {
      title: 'Left 4 Dead',
      description: 'From Valve (the creators of Counter-Strike, Half-Life and more) comes Left 4 Dead, a co-op action horror game for the PC and Xbox 360 that casts up to four players in an epic struggle for survival against swarming zombie hordes and terrifying mutant monsters.',
      price: 9.99,
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/500/header.jpg',
      publisherId: publisherRockstar.id,
      categories: ['Action', 'Shooter']
    }
  ];

  for (const game of gamesData) {
    const existingGame = await prisma.game.findFirst({
        where: { title: game.title }
    });

    if (!existingGame) {
        await prisma.game.create({
            data: {
                title: game.title,
                description: game.description,
                price: game.price,
                imageUrl: game.imageUrl,
                publisherId: game.publisherId,
                categories: {
                    connect: game.categories.map(c => ({ name: c }))
                }
            }
        });
        console.log(`Created game: ${game.title}`);
    } else {
        // Update existing game with new image URL
        await prisma.game.update({
            where: { id: existingGame.id },
            data: {
                imageUrl: game.imageUrl
            }
        });
        console.log(`Updated image for: ${game.title}`);
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
