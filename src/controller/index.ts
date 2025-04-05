import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import RedisService from '../services/redis';
import UrlService from '../services/urlService';

export const crawler = async (req: Request, res: Response) => {
    const crawlerSchema = z.object({
        urls: z.array(z.string().url()),
        hardCheck: z.boolean().default(false),
    });

    const validation = crawlerSchema.parse(req.body);

    const urls = validation.urls;

    const domainUrlMap: Record<string, string[]> = {};

    await Promise.all(urls.map(async (url) => {
        let productUrls: string[] | null = [];
        try {
            productUrls = await RedisService.getUrlWithMongoFallback(url);
        }
        catch (error) {
            console.log(`Error fetching URL from Redis or MongoDB: ${error}`);
        }
        if (productUrls && productUrls.length > 0) {
            if (validation.hardCheck) {
                await Promise.allSettled(productUrls.map(async (productUrl) => {
                    const isValid = await UrlService.testUrl(productUrl);
                    if (!isValid) {
                        console.log(`Invalid URL: ${productUrl}`);
                    }
                }));
            }
            const domain = new URL(url).hostname;
            domainUrlMap[domain] = domainUrlMap[domain] || [];
            domainUrlMap[domain].push(...productUrls);
        } else {
            console.log(`URL not found in Redis or MongoDB: ${url}`);
            const newUrls = await UrlService.getProductUrls(url, validation.hardCheck);
            const domain = new URL(url).hostname;
            domainUrlMap[domain] = domainUrlMap[domain] || [];
            domainUrlMap[domain].push(...newUrls);
        }
    }));

    res.status(StatusCodes.ACCEPTED).send(domainUrlMap);
};
