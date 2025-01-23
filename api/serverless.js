export default function handler(req, res) {
    // Set up CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*'); // Replace '*' with your frontend domain for better security
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // Handle preflight requests (OPTIONS method)
    if (req.method === 'OPTIONS') {
      res.status(200).end(); // Respond with a 200 OK for preflight
      return;
    }
  
    // Main API logic for other HTTP methods
    if (req.method === 'GET') {
      res.status(200).json({ message: 'Hello, this is a GET request!' });
    } else if (req.method === 'POST') {
      res.status(200).json({ message: 'Hello, this is a POST request!' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
  