import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import RedisService from '../services/redis'
import UrlService from '../services/urlTester';

export const crawler = async (req: Request, res: Response) => {
    const crawlerSchema = z.object({
        urls: z.array(z.string().url()),
        hardCheck: z.boolean().default(false),
    });

    const validation = crawlerSchema.parse(req.body);

    const urls = validation.urls;


    const productUrls = (await Promise.all(urls.map(async (url) => {
        const productUrl = await RedisService.getUrlWithMongoFallback(url);
        if (productUrl) {
            if(validation.hardCheck ){
                Promise.all(productUrl.map(async (productUrl) => {
                    const isValid = await UrlService.testUrl(productUrl);
                    if (!isValid) {
                        console.log(`Invalid URL: ${productUrl}`);
                        throw new Error(`Invalid URL: ${productUrl}`);
                    }
                }));
                return productUrl;
            }
            else {
                return productUrl;
            }
        } else {
            const newUrls = await UrlService.getProductUrls(url, validation.hardCheck);
            await RedisService.setUrlWithMongoFallback(url, newUrls);
            return newUrls;
        }
    }))).flat();

    res.status(StatusCodes.ACCEPTED).send(productUrls);
};
