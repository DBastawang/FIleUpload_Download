import express from "express";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcryptjs";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();

app.use(cors({
  origin: "http://localhost:4800",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// dummy datas
const users = [
  { id: 1, username: "admin", password: bcrypt.hashSync("1234", 10), role: "Admin" },
  { id: 2, username: "teacher", password: bcrypt.hashSync("abcd", 10), role: "Teacher" },
  { id: 3, username: "student", password: bcrypt.hashSync("qwert", 10), role: "Student" },
];



passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (username, password, done) => {
      const user = users.find((u) => u.username === username);
      if (!user) return done(null, false, { message: "User not found" });

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) return done(null, false, { message: "Wrong password" });

      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user);
});


app.get("/", (req, res) => res.send("Hello from Passport Authentication Demo!"));

//auhtenticat
app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Login success!", user: req.user });
});
app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.send("Logged out successfully");
  });
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

//roles based 
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized: Please log in" });
}
function adminners(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "Admin") return next();
  return res.status(403).json({ message: "Forbidden: Admins only" });
}
function ensureAdminOrStudent(req, res, next) {
  if (req.isAuthenticated() && (req.user.role === "Admin" || req.user.role === "Student"))
    return next();
  return res.status(403).json({ message: "Forbidden: Only Admins or Students" });
}

//uploaders
app.post('/upload', adminners, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.status(200).send({ message: 'File uploaded successfully!', file: req.file });
});


app.get('/files', ensureAdminOrStudent, (req, res) => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: 'Error reading uploads' });
    res.json(files);
  });
});

//downnloaders
app.get('/download', ensureAdminOrStudent, (req, res) => {
  const { filename } = req.query;
  if (!filename) return res.status(400).send("Filename required");

  const filePath = path.join(process.cwd(), 'uploads', filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");

  res.download(filePath);
});


app.listen(3000, () => console.log("Server running at http://localhost:3000"));