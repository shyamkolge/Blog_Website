import express from 'express';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import globalErrorHandler from './middlewares/errorHandling.js';
import session from 'express-session';
import passport from './config/passport.js';


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Session configuration for Passport (needed for OAuth flow)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Sample route
app.get('/', (req, res) => {
    res.send('Welcome to the Blog Backend!');
});


// Authentication routes
app.use("/api/v1/auth", authRoutes);


// Blog routes
import blogRoutes from './routes/blog.routes.js';
app.use("/api/v1/blogs", blogRoutes);

// Error handling middleware (must be last)
app.use(globalErrorHandler);

export default app;