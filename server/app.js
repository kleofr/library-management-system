const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'library_management_system'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Library Management System');
});

// API endpoint for fetching all books with status and allotment details
app.get('/books', (req, res) => {
    const { key } = req.query;
  
    if (!key) {
      res.status(400).json({ error: 'Search key is required' });
      return;
    }
  
    const query = `
      SELECT * FROM books
      WHERE BookID LIKE '%${key}%' 
      OR BookName LIKE '%${key}%' 
      OR Author LIKE '%${key}%' 
      OR Genre LIKE '%${key}%'
    `;
  
    db.query(query, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (result.length === 0) {
        res.status(404).json({ error: 'No books found matching the search key' });
        return;
      }
      res.json(result);
    });
  });
  
   

// API endpoint for student search
app.get('/students', (req, res) => {
    const key = req.query.key;
    if (!key) {
      res.status(400).json({ error: 'Invalid search key' });
      return;
    }
  
    const query = `
      SELECT * 
      FROM students 
      WHERE ERPId = '${key}' 
         OR Name LIKE '%${key}%' 
         OR PhoneNo = '${key}' 
         OR Department LIKE '%${key}%'
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(result);
    });
  });
  
// API endpoint for book registration
// API endpoint for book registration
app.post('/books/register', (req, res) => {
    const { bookId, bookName, author, genre } = req.query;
  
    // Check if all required parameters are provided
    if (!bookId || !bookName || !author || !genre) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
  
    // SQL query to insert book details into the database
    const registerBookQuery = `INSERT INTO Books (BookId, BookName, Author, Genre) VALUES (${bookId}, '${bookName}', '${author}', '${genre}')`;
  
    // Execute the SQL query
    db.query(registerBookQuery, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Book registered successfully' });
    });
  });
  
  
  // API endpoint for student registration
// API endpoint for student registration
app.post('/students/register', (req, res) => {
    const { erpId, name, phoneNo, department } = req.query;
  
    // Check if all required parameters are provided
    if (!erpId || !name || !phoneNo || !department) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
  
    // SQL query to insert student details into the database
    const registerStudentQuery = `INSERT INTO Students (ERPId, Name, PhoneNo, Department) VALUES ('${erpId}', '${name}', '${phoneNo}', '${department}')`;
  
    // Execute the SQL query
    db.query(registerStudentQuery, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Student registered successfully' });
    });
  });
  

  // API endpoint for book allotment
  app.post('/books/allot', (req, res) => {
    const { erpId, bookId } = req.body;
    
    // Check if both ERPId and BookId are provided
    if (!erpId || !bookId) {
      res.status(400).json({ error: 'ERPId and BookId are required' });
      return;
    }
  
    // Check if the book exists
    const checkBookQuery = `SELECT * FROM Books WHERE BookId = ${bookId}`;
    db.query(checkBookQuery, (bookErr, bookResult) => {
      if (bookErr) {
        res.status(500).json({ error: bookErr.message });
        return;
      }
      if (bookResult.length === 0) {
        res.status(404).json({ error: `Book with ID ${bookId} not found` });
        return;
      }
  
      // Check if the book is available
      const bookStatus = bookResult[0].Status;
      if (bookStatus !== 'Available') {
        res.status(400).json({ error: 'Book is not available for allotment' });
        return;
      }
  
      // Allot the book to the student
      const allotBookQuery = `
        INSERT INTO BookAllotments (ERPId, BookId) 
        VALUES ('${erpId}', ${bookId})
      `;
      db.query(allotBookQuery, (allotErr, allotResult) => {
        if (allotErr) {
          res.status(500).json({ error: allotErr.message });
          return;
        }
        
        // Update book status to 'Allotted'
        const updateBookStatusQuery = `
          UPDATE Books 
          SET Status = 'Allotted' 
          WHERE BookId = ${bookId}
        `;
        db.query(updateBookStatusQuery, (updateErr, updateResult) => {
          if (updateErr) {
            res.status(500).json({ error: updateErr.message });
            return;
          }
          res.json({ message: `Book with ID ${bookId} allotted to ERP ID ${erpId}` });
        });
      });
    });
  });  

// Add more API endpoints for CRUD operations as needed, e.g., book registration, student registration, book allotment, etc.

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
