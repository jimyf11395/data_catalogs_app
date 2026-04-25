import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import catalogRouter from './routes/catalog';
import kpisRouter from './routes/kpis';
import glossaryRouter from './routes/glossary';
import lineageRouter from './routes/lineage';
import reportsRouter from './routes/reports';
import dqRulesRouter from './routes/dqRules';
import usersRouter from './routes/users';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/catalog', catalogRouter);
app.use('/kpis', kpisRouter);
app.use('/glossary', glossaryRouter);
app.use('/lineage', lineageRouter);
app.use('/reports', reportsRouter);
app.use('/dq-rules', dqRulesRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
