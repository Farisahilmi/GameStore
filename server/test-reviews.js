
const { addReview, getGameReviews } = require('./src/controllers/reviewController');
const prisma = require('./src/utils/prisma');

async function main() {
  try {
    const user = await prisma.user.findFirst();
    const game = await prisma.game.findFirst();

    if (!user || !game) {
        console.log("User or Game not found");
        return;
    }

    console.log(`Testing reviews for User: ${user.id}, Game: ${game.id}`);

    // Mock Req/Res for Add Review
    const req = {
        params: { gameId: game.id },
        body: { rating: 5, comment: "Test Review from script" },
        user: { id: user.id, name: user.name }
    };

    const res = {
        status: (code) => ({
            json: (data) => {
                console.log(`Response Status: ${code}`);
                console.log(data);
            }
        })
    };
    
    const next = (err) => console.error("Error:", err);

    // Clean up existing review first to avoid duplicate error
    await prisma.review.deleteMany({
        where: { userId: user.id, gameId: game.id }
    });

    // We also need to ensure the user OWNS the game or is ADMIN
    // Let's force add to library
    await prisma.library.upsert({
        where: { userId_gameId: { userId: user.id, gameId: game.id } },
        update: {},
        create: { userId: user.id, gameId: game.id }
    });

    console.log("Adding review...");
    await addReview(req, res, next);

    console.log("Fetching reviews...");
    await getGameReviews(req, res, next);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
