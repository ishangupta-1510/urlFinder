import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import RedisService from '../services/redis'
import UrlService from '../services/urlTester';

export const crawler = (req: Request, res: Response) => {
    const crawlerSchema = z.object({
        urls: z.array(z.string().url())
    });

    const validation = crawlerSchema.parse(req.body);

    const urls = validation.urls;

    let productUrls: string[] = [];

    urls.forEach(async (url) => {
        // check if the url exist in redis then in mongodb
        const productUrl = await RedisService.getUrlWithMongoFallback(url);
        if (productUrl && await UrlService.testUrl(productUrl)) {
            productUrls.push(productUrl);
        }
        else {
            const urls = await UrlService.getProductUrls(url);
            productUrls = [...productUrls, ...urls];
        }
    })

    res.status(StatusCodes.ACCEPTED).send(productUrls);
};
