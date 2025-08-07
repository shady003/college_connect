import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  console.log('Cookies:', req.cookies);
  const token = req.cookies.access_token;
  
  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token", error: err.message });
    }
    
    req.user = payload;
    next();
  });
};

app.post('/test-auth', verifyToken, (req, res) => {
  res.json({ message: 'Auth working', user: req.user });
});

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});