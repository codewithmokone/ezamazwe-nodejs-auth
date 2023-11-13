// Firebase admin SDK Authentication

const express = require('express');     //express - Creates an Express application. The express() function is a top-level function exported by the express module.

const admin = require('firebase-admin');    //import the firebase-admin package

var cors = require('cors')

const app = express();

const port = process.env.PORT || 4000;

const serviceAccount = require('./serviceAccountKey.json'); // Key downloaded from Firebase Console

const router = express.Router();

admin.initializeApp({     // Initialize Firebase Admin SDK
  credential: admin.credential.cert(serviceAccount),    
  databaseURL: "https://edutech-app-eecfd-default-rtdb.firebaseio.com"
});

// Add body parsing middleware
app.use(express.json());
// json - Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.

app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to the admin dashboard!');
});

app.get('/create-user', async (req, res) =>{
  res.send('Create user dashboard.');
});

// Create new user
app.post('/create-user', async (req, res) => {
  
  // const email = req.body.email;
  // const password = req.body.password;
  // const role = req.body.password;
  const {email, password, role} = req.body
  
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      role,
    });

    res.status(200).json(userRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/add-admin-role', (req, res) => {
  res.send('Admin settings dashboard.');
});

// adding admin privileges to a user by setting custom claims using the Firebase Authentication SDK
app.post('/add-admin-role', (req, res) => {     // http://localhost:3000/add-admin
  const email = req.body.email; // Email of the new admin

  // Add custom admin claims to the user 
  admin
    .auth()
    .getUserByEmail(email)
    .then((user) => {
      return admin.auth().setCustomUserClaims(user.uid, { admin: true });
    })
    .then(() => {
      res.json({ status: 'success' });
    })
    .catch((error) => {
      res.status(400).json({ error: error.message });
    });
});

// Fetch and view user records
app.get('/view-users', async (req, res) => {
  try {
    const userRecords = await admin.auth().listUsers();
    const users = userRecords.users;
    // res.render('users', { users });   // For rendering an HTML view.
    res.status(200).json(users);      // For sending a JSON response.
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

// Delete a specific user
app.delete('/delete-user', async (req, res) => {
  const uid = req.body.uid;     // User's UID to delete

  try {
    await admin.auth().deleteUser(uid);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// app.post("/reset-password", (req, res) => {
//     const email = req.body.email; // Get the user's email from the request body
  
//     admin
//       .auth()
//       .generatePasswordResetLink(email)
//       .then((link) => {
//         const mailOptions = {
//           from: "codewithmokone@gmail.com",
//           to: email,
//           subject: "Password Reset",
//           text: `Click this link to reset your password: ${link}`,
//         };
  
//         // Send the email
//         transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//             console.error("Error sending password reset email:", error);
//             res.status(500).json({ error: "Unable to send password reset email." });
//           } else {
//             console.log("Password reset email sent:", info.response);
//             res.status(200).json({ message: "Password reset email sent." });
//           }
//         });
//       })
//       .catch((error) => {
//         console.error("Error generating password reset link:", error);
//         res.status(500).json({ error: "Unable to generate password reset link." });
//       });
//   });

app.post("/reset-password", (req, res) => {
    const email = req.body.email; // Get the user's email from the request body
  
    admin
      .auth()
      .generatePasswordResetLink(email)
      .then((link) => {
        // Send the password reset link to the user's email
        // You can use your preferred method to send emails, like Nodemailer or a third-party service
        // For this example, we'll just log the link to the console
        console.log("Password reset link:", link);
  
        res.status(200).json({ message: "Password reset email sent." });
      })
      .catch((error) => {
        console.error("Error sending password reset email:", error);
        res.status(500).json({ error: "Unable to send password reset email." });
      });
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});