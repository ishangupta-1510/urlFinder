import { Request, Response } from 'express';
import {StatusCodes} from 'http-status-codes';
import { z } from 'zod';

export const crawler = (req: Request, res: Response) => {
    const crawlerSchema = z.object({
        urls: z.array(z.string().url())
    });

    const validation = crawlerSchema.parse(req.body);

    const urls = validation.urls;

    

    res.status(StatusCodes.ACCEPTED).send('Crawler is running');
};
