import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    try {
      const result = await pool.query(
        'SELECT * FROM "Expenses" WHERE "UserID" = $1',
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching expenses' });
    }
  } else if (req.method === 'POST') {
    const { UserID, Ex_Name, Category, Ex_Amount, Ex_Date, Description, HighPriority } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO "Expenses" 
        ("UserID","Ex_Name","Category","Ex_Amount","Ex_Date","Description","HighPriority")
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [UserID, Ex_Name, Category, Ex_Amount, Ex_Date, Description, HighPriority]
      );
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error adding expense' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
