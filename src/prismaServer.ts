import express from 'express';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

async function saveData(key: any, value: any) {
    try {
        const user = await prisma.user.create({
            data: {
                name: key,
                email: value
            }
        });
        console.log('User saved:', user);
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

app.post('/save', async (req: { body: { key: any; value: any; }; }, res: { send: (arg0: string) => void; }) => {
    const { key, value } = req.body;
    await saveData(key, value);
    res.send('Data saved');
});

process.on('exit', async () => {
    await prisma.$disconnect();
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
