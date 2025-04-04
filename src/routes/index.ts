import { Router } from 'express'
import { crawler } from '../controller';

const router = Router();

router.get('/', (req, res) => {
    res.send('Healthy, Express!');
});

router.post('/crawler', crawler);

export default router