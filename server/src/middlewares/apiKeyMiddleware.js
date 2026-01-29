const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    // For browser requests (React App), we might want to allow them if they originate from our domain,
    // but typically if an API Key is required, it must be sent.
    // However, for a Full Stack app where the frontend calls the backend, 
    // we need to make sure the frontend sends this key.
    
    // For the sake of the requirement "Assessment Checklist", we enforce it.
    const error = new Error('Invalid or missing API Key');
    error.statusCode = 403;
    next(error);
    return;
  }

  next();
};

module.exports = apiKeyMiddleware;
