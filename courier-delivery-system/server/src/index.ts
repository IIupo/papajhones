import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import orderRoutes from './routes/orders';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});